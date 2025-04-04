import {
  formatCinemaRawText,
  formatMovieRawText,
  embeddings,
} from "@/utils/mongodb-atlas/index.js";
import {
  CINEPOLIS_CITIES_BASE_URL,
  CINEPOLIS_MOVIE_BASE_URL,
  CINEPOLIS_MOVIE_PAGE_BASE_URL,
  CINEPOLIS_SCHEDULE_CINEMA_BASE_URL,
  CINEPOLIS_STATIC_IMAGES_BASE_URL,
} from "@/utils/cinepolis/constants.js";
import type {
  CinemaMovies,
  CityCinemas,
  DateFormat,
  PageProps,
  Schedule,
  Schedules,
  TodayMovies,
} from "@/types";

function getCurrentLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
const todayIsoStringDataShort = getCurrentLocalDateString(); // yyyy-mm-dd

async function fetchCinemasByCityId(cityId: number) {
  const response = await fetch(
    `${CINEPOLIS_CITIES_BASE_URL}?ciudad_id=${cityId}`
  );
  const { cinemas }: CityCinemas = await response.json();
  return cinemas.map(({ id, uris, name, address }) => ({
    id,
    uris,
    name,
    address,
  }));
}
export async function fetchScheduleByCinemaId(cinemaId: number) {
  const response = await fetch(
    `${CINEPOLIS_SCHEDULE_CINEMA_BASE_URL}?cinema_id=${cinemaId}`
  );
  const scheduleData: Schedules = await response.json();
  return scheduleData;
}
async function filterMovieSchedulesByDate(
  moviesSchedules: Schedule[],
  dateString: string = todayIsoStringDataShort
) {
  return moviesSchedules
    .filter((sch) => sch.dates.some((d) => d.date === dateString))
    .map(({ movie_id, cinema_id, dates }) => {
      const formats = dates.find((d) => d.date === dateString)?.formats;
      if (!formats) {
        return { movie_id, cinema_id, formats: [] };
      } else {
        return { movie_id, cinema_id, formats: formats };
      }
    });
}

async function getMoviePageProps(movieCode: string) {
  const moviePageUrl = `${CINEPOLIS_MOVIE_PAGE_BASE_URL}/${movieCode}.json?movie=${movieCode}`;
  try {
    const response = await fetch(moviePageUrl);
    const {
      pageProps: {
        dataMovie: { cast, rating, rating_description },
      },
    }: PageProps = await response.json();
    const directorsCommaList = cast
      .find((c) => c.label === "Directores")
      ?.value.join(", ");
    const actorsCommaList = cast
      .find((c) => c.label === "Actores")
      ?.value.join(", ");
    return {
      directors: directorsCommaList?.length ? directorsCommaList : "",
      cast: actorsCommaList?.length ? actorsCommaList : "",
      rating,
      ratingDescription: rating_description,
    };
  } catch (_error) {
    return { directors: "", cast: "", rating: "", ratingDescription: "" };
  }
}
/**
 *
 * @param fullDateTime e.g '2025-10-10T15:00:00'
 * @returns e.g 1500
 */
function getTimeFromFullDateTime(fullDateTime: string): number {
  const twodigitsRegex = /^\d{2}$/;
  const [hourStr, minuteStr] = fullDateTime
    .trim()
    .split("T")[1]
    .split(":")
    .slice(0, 2);

  // Check format validity
  if (
    !hourStr ||
    !minuteStr || // Missing parts
    !twodigitsRegex.test(hourStr) ||
    !twodigitsRegex.test(minuteStr)
  ) {
    throw new Error("Invalid time format");
  }

  // Convert to numbers
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Validate time ranges
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid time range");
  }

  return hour * 100 + minute;
}

function getShowTimeFromFormats(dateFormats: DateFormat[]) {
  return dateFormats.map((f) => {
    const { language, showtimes } = f;
    // screen is the same for each showtime, so we can just get the first one
    const screen = showtimes[0].screen;
    const startTimes = showtimes.map((s) => {
      const { datetime: startTime } = s;
      return getTimeFromFullDateTime(startTime);
    });
    return { language, startTimes, screen };
  });
}
function getMoviesFromSchedules(
  schedules: {
    movie_id: number;
    cinema_id: number;
    formats: DateFormat[];
  }[],
  movies: CinemaMovies[]
) {
  const moviesIdList = movies.map((m) => m.id);
  return schedules
    .filter((sch) => moviesIdList.includes(sch.movie_id))
    .map((sch) => ({
      // previously filtered, so it's safe to use ! here
      movie: movies.find((m) => m.id === sch.movie_id)!,
      sch,
    }))
    .map(async ({ movie, sch }) => {
      const { cast, directors, rating } = await getMoviePageProps(movie.code);
      const movieRawText = formatMovieRawText({
        movieName: movie.name,
        synopsis: movie.synopsis,
        genre: movie.genre,
        movieLength: movie.length,
        movieCast: cast,
        movieDirectors: directors,
      });
      const movieEmbeddings = await embeddings.embedQuery(movieRawText);
      return {
        movieId: movie.id,
        movieName: movie.name,
        movieLength: movie.length,
        movieRating: rating,
        movieCode: movie.code,
        movieRawText,
        movieEmbeddings,
        movieCast: cast,
        movieDirectors: directors,
        movieUrl: `${CINEPOLIS_MOVIE_BASE_URL}/${movie.code}`,
        synopsis: movie.synopsis,
        genre: movie.genre,
        formats: getShowTimeFromFormats(sch.formats),
        moviePoster: `${CINEPOLIS_STATIC_IMAGES_BASE_URL}/${movie.id}/1/1/${movie.id}.jpg`,
      };
    });
}

// city id = 42 is for Guatemala City
export async function fetchDataForCity(cityId: number = 42) {
  const cityData: {
    cityName: string;
    cinemas: {
      cinemaName: string;
      cinemaAddress: string;
      cinemaEmbeddings: number[];
      cinemaRawText: string;
      movies: TodayMovies;
    }[];
  } = {
    cityName: "Guatemala City",
    cinemas: [],
  };
  const cityCinemasList = await fetchCinemasByCityId(cityId);
  const schedulesResponsePromises = cityCinemasList.map((cinema) =>
    fetchScheduleByCinemaId(cinema.id)
  );
  // traverse the Promises array
  for await (const schedules of schedulesResponsePromises) {
    const { name: cinemaName, address: cinemaAddress } =
      schedules["schedules"]["cinemas"][0];
    const {
      schedules: { schedules: moviesSchedule, movies },
    } = schedules;
    // filter for today's schedules data as e.g '2025-10-10'
    const todaySchedules = await filterMovieSchedulesByDate(moviesSchedule);

    const todayMoviesData = await Promise.allSettled(
      getMoviesFromSchedules(todaySchedules, movies)
    );
    // filter out the fulfilled promises and map to get the value
    const todayMovies = todayMoviesData
      .filter((m) => m.status === "fulfilled")
      .map((m) => m.value);
    const cinemaRawText = formatCinemaRawText({
      name: cinemaName,
      cinemaAddress,
    });
    const cinemaEmbeddings = await embeddings.embedQuery(cinemaRawText);
    cityData.cinemas.push({
      cinemaName,
      cinemaAddress,
      cinemaEmbeddings,
      cinemaRawText,
      movies: todayMovies,
    });
  }
  return cityData;
}
