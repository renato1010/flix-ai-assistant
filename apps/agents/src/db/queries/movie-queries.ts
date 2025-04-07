import { prisma } from "@/db/client.js";
import { dashLine, getNowHrsAndMinutes } from "@/utils/misc.js";
import { getStringFromFormat } from "@/db/queries/utils.js";

export async function getMovieStartTimes(movieName: string) {
  const scheduleList = await prisma.movie.findMany({
    where: {
      movieName: {
        contains: movieName,
        mode: "insensitive",
      },
    },
    select: {
      movieName: true,
      cinema: {
        select: {
          name: true,
          cinemaAddress: true,
        },
      },
      formats: {
        select: {
          startTime: true,
          language: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 60 * 60, // 1 hour
    },
  });

  return scheduleList.map(({ cinema, formats, movieName }) => {
    const { name, cinemaAddress } = cinema;
    // filter by start time greater than now
    const now = getNowHrsAndMinutes();
    return {
      movieName,
      cinemaName: name,
      cinemaAddress,
      schedule: formats
        .filter(({ startTime }) => startTime.some((time) => time >= now))
        .map(({ language, startTime }) => ({
          language,
          startTime: startTime.filter((time) => time >= now),
        })),
    };
  });
}

// list movies by genre and optionally by cinema
export async function getMoviesByGenreAndCinema(
  genre: string,
  cinemaName?: string
) {
  const movies = await prisma.movie.findMany({
    where: {
      genre: {
        contains: genre,
        mode: "insensitive",
      },
      ...(cinemaName && {
        cinema: {
          name: {
            contains: cinemaName,
            mode: "insensitive",
          },
        },
      }),
    },
    select: {
      movieName: true,
      genre: true,
      cinema: {
        select: {
          name: true,
          cinemaAddress: true,
        },
      },
      movieUrl: true,
      formats: {
        select: { startTime: true },
      },
    },
    cacheStrategy: {
      ttl: 4 * 60 * 60, // 4 hour
    },
  });
  const refined = movies.map(
    ({ cinema, formats, movieName, genre, movieUrl }, idx) => {
      const { name, cinemaAddress } = cinema;
      return `
    Option: ${idx + 1}
    Movie Name: ${movieName}
    Genre: ${genre}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    Movie Schedule: ${getStringFromFormat(formats)}
    Movie URL: ${movieUrl}
    `;
    }
  );
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, "");
  return contentList;
}

// TODO: remove this before deploying to production
// (async () => {
//   const movies = await getMoviesByGenreAndCinema("Terror");
//   console.dir({ movies }, { depth: Infinity });
// })().catch((err) => {
//   console.error("Error: ", err);
// });
