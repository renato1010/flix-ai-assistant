import { prisma } from "@/db/client.js";
import { dashLine } from "@/utils/misc.js";

function getMovieTheatersfromMovieNameQuery(movieTitle: string) {
  return prisma.cinema.findMany({
    where: {
      movies: {
        some: {
          movieName: {
            contains: movieTitle,
            mode: "insensitive",
          },
        },
      },
    },
    select: {
      name: true,
      cinemaAddress: true,
      movies: {
        where: {
          movieName: {
            contains: movieTitle,
            mode: "insensitive",
          },
        },
        select: {
          movieName: true,
          formats: {
            select: {
              startTime: true,
            },
          },
        },
      },
    },
    distinct: ["name"],
    cacheStrategy: {
      ttl: 4 * 60 * 60, // 4 hour
    },
  });
}

export async function getTheatersFromMovieName(movieTitle: string) {
  const movieTheaters = await getMovieTheatersfromMovieNameQuery(movieTitle);
  const refined = movieTheaters.map(({ name, cinemaAddress, movies }, idx) => {
    const { movieName, formats } = movies[0];
    const startTimes = formats
      .map(({ startTime }) => startTime)
      .flat()
      .map((time) => {
        // cast to string
        const stringTime = time.toString();
        // separate first two characters from last two
        const hours = stringTime.slice(0, 2);
        const minutes = stringTime.slice(2, 4);
        return `${hours}:${minutes}`;
      });
    return `
    Option: ${idx + 1}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    Movie Name: ${movieName}
    Movie Schedule: ${startTimes}
    `;
  });
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, dashLine);
  return contentList;
}

// TODO: remove this before deploying
// (async () => {
//   const textResponse = await getTheatersFromMovieName("Mufasa: El rey león");
//   console.dir({ textResponse }, { depth: Infinity });
// })().catch((error) => {
//   console.error("Error: ", error);
// });
