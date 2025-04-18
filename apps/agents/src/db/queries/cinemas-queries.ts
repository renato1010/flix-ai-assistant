import { prisma } from "@/db/client.js";
import { dashLine, getNowHrsAndMinutes } from "@/utils/misc.js";
import { getStringFromFormat } from "@/db/queries/utils.js";

function getTheatersShowingMovieQuery(movieTitle: string) {
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

export async function getTheatersShowingMovie(movieTitle: string) {
  const movieTheaters = await getTheatersShowingMovieQuery(movieTitle);
  const refined = movieTheaters
    // the list of movies always have 1 item.
    .filter(({ movies }) => {
      const formats = movies[0].formats;
      const startTimes = formats.flatMap(({ startTime }) => startTime);
      return startTimes.some((timeAsNumber) => timeAsNumber > getNowHrsAndMinutes());
    })
    .map(({ name, cinemaAddress, movies }, idx) => {
      const { movieName, formats } = movies[0];
      const startTimes = getStringFromFormat(formats).join(", ");
      return `
    Option: ${idx + 1}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    Movie Name: ${movieName}
    Movie Schedule: ${startTimes}
    `;
    });
  if (refined.length < 1) {
    return `No theaters found showing the movie "${movieTitle}" at this time.`;
  }
  const contentList = refined.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, dashLine);
  return contentList;
}

export async function getTheatersLocatedInZone(zones: string[]) {
  const movieTheatersPromise = (zone: string) =>
    prisma.cinema.findMany({
      where: {
        cinemaAddress: {
          contains: zone,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        cinemaAddress: true,
      },
      cacheStrategy: {
        ttl: 4 * 60 * 60, // 4 hour
      },
    });
  const theatersResults = await Promise.allSettled(zones.map((z) => movieTheatersPromise(z)));
  if (theatersResults.some((result) => result.status === "rejected")) {
    // TODO: think if we want to handle error or just return text
    // throw new Error("Error fetching movie theaters");
    return `Not enough information to provide a list of theaters.`;
  }
  const fullfilled = theatersResults.filter((result) => result.status === "fulfilled");
  const values = fullfilled
    .map((result) => result.value)
    .flat()
    .map(({ cinemaAddress, name }, idx) => {
      return `
    Option: ${idx + 1}
    Theater Name: ${name}
    Theater Address: ${cinemaAddress}
    `;
    });
  const contentList = values.reduce<string>((acc, item) => {
    const line = item;
    return acc + line + dashLine;
  }, dashLine);
  return contentList;
}
