import { prisma } from "@/db/client.js";
import { getNowHrsAndMinutes } from "@/utils/misc.js";

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
