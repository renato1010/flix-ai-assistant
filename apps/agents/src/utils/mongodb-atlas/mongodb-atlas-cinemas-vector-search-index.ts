import { MongoClient, type SearchIndexDescription } from "mongodb";
import {
  MONGODB_ATLAS_DATABASE_NAME,
  MONGODB_ATLAS_VECTOR_DIMENSIONS,
  MONGODB_ATLAS_CINEMA_COLLECTION,
  CINEMAS_VECTOR_INDEX_NAME,
} from "@/utils/mongodb-atlas/index.js";
import { DIRECT_DATABASE_URL } from "@/utils/env-vars.js";

const client = new MongoClient(DIRECT_DATABASE_URL);

export async function createMongoDBCinemasVectorIndex() {
  const database = client.db(MONGODB_ATLAS_DATABASE_NAME);
  const collection = database.collection(MONGODB_ATLAS_CINEMA_COLLECTION);
  // define your Atlas Vector Search index
  const numDimensions = parseInt(MONGODB_ATLAS_VECTOR_DIMENSIONS, 10);
  const index: SearchIndexDescription = {
    name: CINEMAS_VECTOR_INDEX_NAME,
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          numDimensions,
          path: "cinemaEmbeddings",
          similarity: "cosine",
          quantization: "scalar",
        },
      ],
      $project: {
        score: { $meta: "vectorSearchScore" },
      },
    },
  };
  if (!index.name) {
    throw new Error("Index name is required");
  }
  const hasVectorIndex = await collection.indexExists(index.name);
  if (hasVectorIndex) return;
  try {
    const result = await collection.createSearchIndex(index);
    console.log(`New search index named ${result} was created.`);
    // wait for the index to be ready to query
    console.log(
      "Polling to check if the index is ready. This may take up to a minute."
    );
    let isQueryable = false;
    while (!isQueryable) {
      const cursor = collection.listSearchIndexes();
      for await (const index of cursor) {
        if (index.name === result) {
          // @ts-expect-error need to check if queryable
          if (index.queryable) {
            console.log(`${result} is ready for querying.`);
            isQueryable = true;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to create the index:", error);
  } finally {
    await client.close();
  }
}
