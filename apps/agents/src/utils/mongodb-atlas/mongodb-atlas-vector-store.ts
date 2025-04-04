import { Collection, MongoClient, type Document } from "mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { DIRECT_DATABASE_URL, OPENAI_API_KEY } from "@/utils/env-vars.js";
import {
  MONGODB_ATLAS_DATABASE_NAME,
  MONGODB_ATLAS_MOVIES_COLLECTION,
  MONGODB_ATLAS_CINEMA_COLLECTION,
  CINEMAS_VECTOR_INDEX_NAME,
  MOVIES_VECTOR_INDEX_NAME,
} from "./constants.js";

const mongoClient = new MongoClient(DIRECT_DATABASE_URL);

// collections definitions
const moviesCollection = mongoClient
  .db(MONGODB_ATLAS_DATABASE_NAME)
  .collection(MONGODB_ATLAS_MOVIES_COLLECTION);

const cinemasCollection = mongoClient
  .db(MONGODB_ATLAS_DATABASE_NAME)
  .collection(MONGODB_ATLAS_CINEMA_COLLECTION);

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: OPENAI_API_KEY,
});

type MongoVectorSearchOptions = {
  collection: Collection<Document>;
  indexName: string;
  embeddingKey: string;
  textKey: string;
};

// This function makes Mongo Vector Search reusable by passing variables
// for the collection, indexName, embeddingKey and textKey
function getMongoVectorStore(
  embeddingModel: OpenAIEmbeddings = embeddings,
  mongoVectorSearchOptions: MongoVectorSearchOptions
) {
  const { collection, indexName, embeddingKey, textKey } =
    mongoVectorSearchOptions;
  return new MongoDBAtlasVectorSearch(embeddingModel, {
    collection,
    indexName,
    embeddingKey,
    textKey,
  });
}

// vector store as similarity search retriever
export function getVectorStoreSimilaritySearch(
  embeddingModel: OpenAIEmbeddings = embeddings,
  mongoVectorSearchOptions: MongoVectorSearchOptions,
  query: string,
  k: number = 10,
  filter?: MongoDBAtlasVectorSearch["FilterType"]
) {
  const vectorStore = getMongoVectorStore(
    embeddingModel,
    mongoVectorSearchOptions
  );
  return vectorStore.similaritySearch(query, k, filter);
}

// vector store similarity search with score
export function getVectorStoreSimilaritySearchWithScore(
  embeddingModel: OpenAIEmbeddings = embeddings,
  mongoVectorSearchOptions: MongoVectorSearchOptions,
  query: string,
  k: number = 10,
  filter?: MongoDBAtlasVectorSearch["FilterType"]
) {
  const vectorStore = getMongoVectorStore(
    embeddingModel,
    mongoVectorSearchOptions
  );
  return vectorStore.similaritySearchWithScore(query, k, filter);
}

function mongoDBRetriever(
  mongoVectorStoreOptions: MongoVectorSearchOptions,
  itemsToRetrieve: number = 10,
  embeddingModel: OpenAIEmbeddings = embeddings
) {
  const vectorStore = getMongoVectorStore(
    embeddingModel,
    mongoVectorStoreOptions
  );
  return vectorStore.asRetriever({
    k: itemsToRetrieve,
  });
}

export function moviesRetriever(itemsToRetrieve: number = 10) {
  return mongoDBRetriever(
    {
      collection: moviesCollection,
      indexName: MOVIES_VECTOR_INDEX_NAME,
      embeddingKey: "movieEmbeddings",
      textKey: "movieRawText",
    },
    itemsToRetrieve
  );
}

export function cinemasRetriever(itemsToRetrieve: number = 10) {
  return mongoDBRetriever(
    {
      collection: cinemasCollection,
      indexName: CINEMAS_VECTOR_INDEX_NAME,
      embeddingKey: "cinemaEmbeddings",
      textKey: "cinemaRawText",
    },
    itemsToRetrieve
  );
}

export function cinemasSSWithScore(
  query: string,
  itemsToRetrieve: number = 10,
  filter?: MongoDBAtlasVectorSearch["FilterType"]
) {
  return getVectorStoreSimilaritySearchWithScore(
    embeddings,
    {
      collection: cinemasCollection,
      indexName: CINEMAS_VECTOR_INDEX_NAME,
      embeddingKey: "cinemaEmbeddings",
      textKey: "cinemaRawText",
    },
    query,
    itemsToRetrieve,
    filter
  );
}
