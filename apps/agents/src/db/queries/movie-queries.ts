import { prisma } from "@/db/client.js";
import { dashLine, getNowHrsAndMinutes } from "@/utils/misc.js";
import { getNumberFromTimeString, getStringFromNumber } from "@/db/queries/utils.js";

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

  const options = movieList.map(({ cinema, formats, movieName, genre, movieUrl, synopsis }, idx) => {
    const { name, cinemaAddress } = cinema;
    // filter by start time greater than passed time
    const timeThreshold = time || getStringFromNumber(getNowHrsAndMinutes());
    const formatsFlat = formats.flatMap(({ startTime }) => startTime).sort((a, b) => a - b);
    const filteredByTimeThreshold = formatsFlat
      .filter((timeAsNumber) => {
        return timeAsNumber > getNumberFromTimeString(timeThreshold);
      })
      .map((timeAsNumber) => {
        return getStringFromNumber(timeAsNumber);
      });
    if (filteredByTimeThreshold.length < 1) {
      return "";
    }
    const movieSchedules = filteredByTimeThreshold.join(", ");
    return `
    Option: ${idx + 1}
    Movie Name: ${movieName}
    Sinopsis: ${synopsis}
    Genre: ${genre}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    Movie Schedule: ${movieSchedules}
    Movie URL: ${movieUrl}
    `;
  });
  if (!options.length) {
    return `Cant find info for the movie "${movieName}" 
    ${cinemaName ? 'in the Theater "${cinemaName}" at this time.' : ""} `;
  }
  const contentList = options.reduce<string>((acc, item) => {
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
  const refined = movies.map(({ formats, movieName, genre, movieUrl, synopsis }, idx) => {
    // filter by start time greater than passed time
    const timeThreshold = getStringFromNumber(getNowHrsAndMinutes());
    const formatsFlat = formats.flatMap(({ startTime }) => startTime).sort((a, b) => a - b);
    const filteredByTimeThreshold = formatsFlat
      .filter((timeAsNumber) => {
        return timeAsNumber > getNumberFromTimeString(timeThreshold);
      })
      .map((timeAsNumber) => {
        return getStringFromNumber(timeAsNumber);
      });
    if (filteredByTimeThreshold.length < 1) {
      return "";
    }
    const movieSchedules = filteredByTimeThreshold.join(", ");
    return `
    Movie Option: ${idx + 1}
    Movie Name: ${movieName}
    Genre: ${genre}
    Movie Sinopsis: ${synopsis}
    Movie Schedule: ${movieSchedules}
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
  const refined = movies.map(({ cinema, formats, movieName, genre, movieUrl }, idx) => {
    const { name, cinemaAddress } = cinema;
    // filter by start time greater than passed time
    const timeThreshold = getStringFromNumber(getNowHrsAndMinutes());
    const formatsFlat = formats.flatMap(({ startTime }) => startTime).sort((a, b) => a - b);
    const filteredByTimeThreshold = formatsFlat
      .filter((timeAsNumber) => {
        return timeAsNumber > getNumberFromTimeString(timeThreshold);
      })
      .map((timeAsNumber) => {
        return getStringFromNumber(timeAsNumber);
      });
    if (filteredByTimeThreshold.length < 1) {
      return "";
    }
    const movieSchedules = filteredByTimeThreshold.join(", ");
    return `
    Option: ${idx + 1}
    Movie Name: ${movieName}
    Genre: ${genre}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    Movie Schedule: ${movieSchedules}
    Movie URL: ${movieUrl}
    `;
  });
  if (refined.length < 1) {
    return `No movies found in the genre "${genre}" at this time.`;
  }
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, "");
  return contentList;
}


