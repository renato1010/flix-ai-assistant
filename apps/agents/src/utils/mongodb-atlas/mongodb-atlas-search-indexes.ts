import { MongoClient, type SearchIndexDescription } from "mongodb";
import {
  MONGODB_ATLAS_MOVIES_COLLECTION,
  MONGODB_ATLAS_DATABASE_NAME,
  MONGODB_ATLAS_CINEMA_COLLECTION,
} from "./constants.js";
import { DIRECT_DATABASE_URL } from "../env-vars.js";

const client = new MongoClient(DIRECT_DATABASE_URL);

// The following index definition indexes the Movie -> `movieName` field as string for querying the field
export async function creteMongoDBMovieMovieNameSearchIndex() {
  try {
    const database = client.db(MONGODB_ATLAS_DATABASE_NAME);
    const collection = database.collection(MONGODB_ATLAS_MOVIES_COLLECTION);
    // Define your Atlas Search index
    const index: SearchIndexDescription = {
      name: "movie-moviename-text-search-idx",
      type: "search",
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            movieName: [
              {
                type: "string",
              },
            ],
          },
        },
      },
    };
    if (!index.name) {
      throw new Error("Index name is required");
    }
    // check if the index already exists
    const hasIndex = await collection.indexExists(index.name);
    // If the index already exists, log a message and return do not create it again
    if (!hasIndex) {
      console.log(
        `Search Index ${index.name} for Movie -> movieName already exists`
      );
      return;
    }
    // Call the method to create the index
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}

// The following index definition indexes the Cinema -> 'cinemaAddress' field in Cinema collection for text search'
export async function createMongoDBCinemaCinemaAddSearchIndex() {
  try {
    const database = client.db(MONGODB_ATLAS_DATABASE_NAME);
    const collection = database.collection(MONGODB_ATLAS_CINEMA_COLLECTION);
    // Define your Atlas Search index
    const index: SearchIndexDescription = {
      name: "cinema-cinemaaddress-text-search-idx",
      type: "search",
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            cinemaAddress: [
              {
                type: "string",
              },
            ],
          },
        },
      },
    };
    if (!index.name) {
      throw new Error("Index name is required");
    }
    // check if the index already exists
    const hasIndex = await collection.indexExists(index.name);
    // If the index already exists, log a message and return do not create it again
    if (!hasIndex) {
      console.log(
        `Search Index ${index.name} for Cinema -> cinemaAddress already exists`
      );
      return;
    }
    // Index does not exist, create it
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
