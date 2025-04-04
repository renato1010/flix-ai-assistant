import { MongoClient } from "mongodb";
import { MONGODB_ATLAS_DATABASE_NAME } from "@/utils/mongodb-atlas/index.js";
import { DIRECT_DATABASE_URL } from "@/utils/env-vars.js";

const client = new MongoClient(DIRECT_DATABASE_URL);

export async function dropDatabase() {
  // check if client is ready
  await client.connect();
  // ping to confirm connection is ok
  await client.db(MONGODB_ATLAS_DATABASE_NAME).command({ ping: 1 });
  console.log("Succesfully connected to MongoDB Atlas");
  // drop the database
  const database = client.db(MONGODB_ATLAS_DATABASE_NAME);
  const hasBeenDeleted = await database.dropDatabase();
  return hasBeenDeleted;
}
