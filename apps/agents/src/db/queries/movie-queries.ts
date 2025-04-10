import { prisma } from "@/db/client.js";
import { dashLine, getNowHrsAndMinutes } from "@/utils/misc.js";
import { getNumberFromTimeString, getStringFromFormat, getStringFromNumber } from "@/db/queries/utils.js";

export async function getMovieInfo(movieName: string, cinemaName?: string, time?: string) {
  const movieList = await prisma.movie.findMany({
    where: {
      movieName: {
        contains: movieName,
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
      movieUrl: true,
      synopsis: true,
      cinema: {
        select: {
          name: true,
          cinemaAddress: true,
        },
      },
      formats: {
        select: {
          startTime: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 4 * 60 * 60, // 4 hour
      tags: ["movie_info_by_movie_name"],
    },
  });

  const refined = movieList.map(({ cinema, formats, movieName, genre, movieUrl, synopsis }, idx) => {
    const { name, cinemaAddress } = cinema;
    // filter by start time greater than passed time
    const timeThreshold = time || getStringFromNumber(getNowHrsAndMinutes());
    const filteredByTimeThreshold = formats.filter(({ startTime }) => {
      return startTime.some((t) => t > getNumberFromTimeString(timeThreshold));
    });
    return `
    Option: ${idx + 1}
    Movie Name: ${movieName}
    Sinopsis: ${synopsis}
    Genre: ${genre}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    Movie Schedule: ${getStringFromFormat(filteredByTimeThreshold)}
    Movie URL: ${movieUrl}
    `;
  });
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, "");
  return contentList;
}

// list of movies showing in a particular cinema
export async function getMoviesByCinemaName(cinemaName: string) {
  const movies = await prisma.movie.findMany({
    where: {
      cinema: {
        name: {
          contains: cinemaName,
          mode: "insensitive",
        },
      },
    },
    select: {
      movieName: true,
      genre: true,
      synopsis: true,
      movieUrl: true,
      formats: {
        select: {
          startTime: true,
        },
      },
      cinema: {
        select: {
          name: true,
          cinemaAddress: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 4 * 60 * 60, // 4 hour
      tags: ["movies_by_cinema_name"],
    },
  });
  const refined = movies
    .filter(({ formats }) => {
      return formats.some(({ startTime }) => {
        return startTime.some((t) => t > getNowHrsAndMinutes());
      });
    })
    .map(({ formats, movieName, genre, movieUrl, synopsis }, idx) => {
      const futureSchedules = formats.filter(({ startTime }) => {
        return startTime.some((t) => t > getNowHrsAndMinutes());
      });
      return `
    Movie Option: ${idx + 1}
    Movie Name: ${movieName}
    Genre: ${genre}
    Movie Sinopsis: ${synopsis}
    Movie Schedule: ${getStringFromFormat(futureSchedules).join(", ")}
    Movie URL: ${movieUrl}
    `;
    });
  if (!refined.length) {
    return `No movies found in the cinema "${cinemaName}" at this time.`;
  }
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, "");
  const { cinemaAddress, name } = movies[0]?.cinema ?? {};
  const cinemaHeader = `
  Cinema Name: ${name}
  Cinema Address: ${cinemaAddress}
  `;
  return `
  ${cinemaHeader}

  ${contentList}
  `;
}

// list movies by genre and optionally by cinema
export async function getMoviesByGenreAndCinema(genre: string, cinemaName?: string) {
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
      tags: ["movies_by_genre_and_cinema"],
    },
  });
  const refined = movies
    .filter(({ formats }) => {
      return formats.some(({ startTime }) => {
        return startTime.some((t) => t > getNowHrsAndMinutes());
      });
    })
    .map(({ cinema, formats, movieName, genre, movieUrl }, idx) => {
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
    });
  if (!refined.length) {
    return `No movies found in the genre "${genre}" at this time.`;
  }
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, "");
  return contentList;
}
