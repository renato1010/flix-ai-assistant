import { prisma } from "@/db/client.js";
import { AIMessage, BaseMessage, isAIMessage } from "@langchain/core/messages";
import { dashLine } from "@/utils/misc.js";
import { GraphState } from "@/flix-agent/graph-state.js";

// helpers
export const prettyPrint = (message: BaseMessage) => {
  let txt = `[${message.getType()}]: ${message.content}`;
  if ((isAIMessage(message) && message.tool_calls?.length) || 0 > 0) {
    const tool_calls = (message as AIMessage)?.tool_calls
      ?.map((tc) => `- ${tc.name}(${JSON.stringify(tc.args)})`)
      .join("\n");
    txt += ` \nTools: \n${tool_calls}`;
  }
  console.log(txt);
};
// returns a string array of the movie genres
const getGenresListFromStr = (genreString: string): string[] => {
  // split the genre string by comma and trim each genre
  const genres = genreString.split(",").map((genre) => genre.trim());
  // remove empty strings
  const filteredGenres = genres.filter((genre) => genre !== "");
  return filteredGenres;
};

// prompt template helper functions

// function to get the Cinema names list as a template for a prompt
export async function getCinemaNamesAsTmp(): Promise<string> {
  const list = await prisma.cinema.findMany({
    select: { name: true },
    cacheStrategy: { ttl: 4 * 60 * 60 },
  });
  const listStr = list.reduce<string>((acc, item) => {
    const line = `${item.name},\n`;
    return acc + line;
  }, dashLine);
  return listStr + dashLine;
}

// function to get the list of cinema addresses
export async function getCinemasAddressAsTmp(): Promise<string> {
  const list = await prisma.cinema.findMany({
    select: { cinemaAddress: true },
    cacheStrategy: { ttl: 4 * 60 * 60 },
  });
  const listStr = list.reduce<string>((acc, item) => {
    const line = `${item.cinemaAddress},\n`;
    return acc + line;
  }, dashLine);
  return listStr + "\n" + dashLine;
}

// function to get the distinct list of movie names to pass to the template
export async function getDistinctMovieNamesAsTmp(): Promise<string> {
  const list = await prisma.movie.findMany({
    select: { movieName: true },
    distinct: ["movieName"],
    cacheStrategy: { ttl: 4 * 60 * 60 },
  });
  const listStr = list.reduce<string>((acc, item) => {
    const line = `${item.movieName},\n`;
    return acc + line;
  }, dashLine);
  return listStr + dashLine;
}
// function that returns the list of distinct movie genres
export async function getDistinctMovieGenresAsTmp(): Promise<string> {
  const list = await prisma.movie.findMany({
    select: { genre: true },
    cacheStrategy: { ttl: 4 * 60 * 60 },
  });

  const wholeList = list.map((item) => getGenresListFromStr(item.genre)).flat();
  const distinctList = [...new Set(wholeList)];
  const listStr = distinctList.reduce<string>((acc, item) => {
    const line = `${item},\n`;
    return acc + line;
  }, dashLine);
  return listStr + dashLine;
}

// function that returns a dynamically created prompt for ReACT Agent
export function getReferencesBlock(state: typeof GraphState.State) {
  const {
    chosenCinema: { cinemaRef },
    chosenMovieName: { movieNameRef },
    chosenZone: { zoneRef },
    chosenTime: { timeReference },
    chosenGenre: { genreRef },
  } = state;
  const referencesBlock = [
    cinemaRef ? `Cinema reference: ${cinemaRef}` : "",
    movieNameRef.length ? `Movie(s) reference: ${movieNameRef.join(",")}` : "",
    zoneRef.length ? `Cinema(s) Location reference: ${zoneRef.join(",")}` : "",
    timeReference ? `Time reference: ${timeReference}` : "",
    genreRef.length ? `Genre(s) reference: ${genreRef.join(",")}` : "",
  ].join("\n");
  return dashLine + "\n" + referencesBlock + "\n" + dashLine;
}

// TODO: remove this before deploying to prod
// (async () => {
//   const genreList = await getDistinctMovieGenresAsTmp();
//   console.dir({ genreList }, { depth: Infinity });
// })()
//   .catch((err) => {
//     console.error("Error: ", err);
//   })
//   .finally(() => {
//     console.log("Finished");
//   });
