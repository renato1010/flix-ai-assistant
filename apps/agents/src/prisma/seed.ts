import { prisma } from "@/db/client.js";
import { fetchDataForCity } from "@/prisma/scripts/index.js";
import {
  createMongoDBCinemasVectorIndex,
  createMongoDBMoviesVectorIndex,
} from "@/utils/mongodb-atlas/index.js";

async function main() {
  console.log("Seeding database...");
  console.log("start creating vector indexes...");
  // create movies vector index
  await createMongoDBMoviesVectorIndex();
  // create cinemas vector index
  await createMongoDBCinemasVectorIndex();

  console.log("start seeding the database...");
  // seed the database with data
  const { cinemas, cityName } = await fetchDataForCity();
  await prisma.city.create({
    data: {
      name: cityName,
      cinemas: {
        create: cinemas.map((cinema) => ({
          cinemaAddress: cinema.cinemaAddress,
          name: cinema.cinemaName,
          cinemaEmbeddings: cinema.cinemaEmbeddings,
          cinemaRawText: cinema.cinemaRawText,
          movies: {
            create: cinema.movies.map(({ movieId, formats, ...rest }) => ({
              movieOriginalId: movieId,
              ...rest,
              formats: {
                create: formats.map((format) => ({
                  language: format.language,
                  startTime: format.startTimes,
                  screen: format.screen,
                })),
              },
            })),
          },
        })),
      },
    },
  });
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
