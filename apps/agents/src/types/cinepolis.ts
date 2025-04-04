type MovieRating = 'A' | 'B' | 'B12' | 'B15';
type SubtitleShorts = 'SUB' | 'DOB' | 'ESP';
type Settings = Record<string, unknown>;

type Cinema = {
  id: number;
  vista_id: string;
  uris: string;
  city_id: number;
  name: string;
  lat: string;
  lng: string;
  phone: string;
  address: string;
  position: number;
  status: string;
  settings: Settings;
};
type CinemaFilteredData = {
  id: number;
  uris: string;
  name: string;
  address: string;
};
type CityCinemas = {
  cinemas: Cinema[];
};
type CityData = {
  cityName: string;
  cinemas: CinemaData[];
};
type MovieData = {
  movieName: string;
  movieDurationInMins: number | string;
  movieGenre?: string;
  movieDescription?: string;
  moviePosterUrl?: string;
  movieTrailer?: string;
  movieAudiences?: MovieRating;
  movieAge?: string;
};
type CinemaData = {
  scheduleDates: string[];
  cinemas: Schedules['schedules']['cinemas'];
  movies: Schedules['schedules']['movies'];
};
type Media = {
  resource: string;
  type: string;
  code: string;
};
type CinemaMovies = {
  id: number;
  name: string;
  code: string;
  rating: string;
  original_name: string;
  length: string;
  synopsis: string;
  genre: string;
  media?: Media[];
  position: number;
  release_date: string;
  categories?: string[];
  distributor: string;
  rating_description?: string;
};
type DateShowTimes = {
  vista_id: string;
  datetime: string;
  endDateTime: string;
  screen: number;
  settings: Settings;
};
type DateFormat = {
  format_id: number;
  vista_id: string;
  language: string;
  segob_permission: string;
  showtimes: DateShowTimes[];
};
type ScheduleDate = {
  date: string;
  formats?: DateFormat[];
};
type Schedule = {
  movie_id: number;
  cinema_id: number;
  city_id: number;
  is_special_prices: boolean;
  dates: ScheduleDate[];
};
type Format = {
  id: number;
  name: string;
  display_name: string;
  icon: string;
  language: string;
};
type RouteCode = 'poster' | 'background_synopsis' | 'trailer_mov' | 'icon' | 'poster_horizontal';
type RouteSize = {
  small?: string;
  medium?: string;
  large?: string;
  'x-large'?: string;
};
type Route = {
  code: RouteCode;
  sizes: RouteSize;
};
type Schedules = {
  schedules: {
    dates: string[];
    cinemas: Omit<Cinema, 'uris'>[];
    movies: CinemaMovies[];
    schedules: Schedule[];
    formats: Format[];
    routes: Route[];
  };
};

// movie page
type CastEntity = {
  label: string;
  value: string[];
};
type MediaEntity = {
  resource: string;
  type: string;
  code: string;
};
type DataMovie = {
  rating: string;
  rating_description: string;
  media: MediaEntity[];
  cast: CastEntity[];
  position: number;
  genre: string;
  synopsis: string;
  length: string;
  release_date: string;
  id: number;
  name: string;
  code: string;
  original_name: string;
};
type PageProps = {
  pageProps: {
    dataMovie: DataMovie;
    error: boolean;
  };
};

// custom
type TodayMovies = {
  movieId: number;
  movieName: string;
  movieLength: string;
  movieRating: string;
  movieCode: string;
  movieCast: string;
  movieDirectors: string;
  movieUrl: string;
  synopsis: string;
  genre: string;
  movieRawText: string;
  movieEmbeddings: number[];
  formats: {
    language: string;
    startTimes: number[];
    screen: number;
  }[];
  moviePoster: string;
}[];

export type {
  MovieData,
  MovieRating,
  SubtitleShorts,
  CityCinemas,
  CinemaFilteredData,
  CinemaMovies,
  CinemaData,
  DateFormat,
  Schedule,
  ScheduleDate,
  Schedules,
  CityData,
  PageProps,
  TodayMovies
};
