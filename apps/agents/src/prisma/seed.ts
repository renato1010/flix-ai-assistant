import { prisma } from "@/db/client.js";
import { fetchDataForCity } from "@/prisma/scripts/index.js";
import {
  createMongoDBCinemasVectorIndex,
  createMongoDBMoviesVectorIndex,
  dropDatabase,
} from "@/utils/mongodb-atlas/index.js";

async function main() {
  console.log("dropping out database...");
  // drop the database
  const hasBeenDeleted = await dropDatabase();
  if (!hasBeenDeleted) {
    console.error("Error dropping out database");
    throw new Error("Error dropping out database");
  }
  console.log("database dropped successfully");
  console.log("Seeding database...");
  console.log("start creating vector indexes...");
  // create movies vector index
  await createMongoDBMoviesVectorIndex();
  // create cinemas vector index
  await createMongoDBCinemasVectorIndex();

  console.log("start seeding the database...");
  console.log("start fetching data for Guatemala City...");
  // seed the database with data
  const { cinemas, cityName } = await fetchDataForCity();
  console.log("data fetched successfully");
  console.log("writing to database...");
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
  console.log("data written successfully");
}

(async () => {
  try {
    await main();
    console.log("🌱 Seeding completed successfully");
  } catch (error) {
    throw new Error(`Seeding failed: ${error}`);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database");
    process.exit(0);
  }
})().catch((error) => {
  console.error("Error during seeding:", error);
  process.exit(1);
});
