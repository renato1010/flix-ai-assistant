import { isHumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { GraphState } from "@/flix-agent/graph-state.js";
import {
  getCinemaNamesAsTmp,
  getCinemasAddressAsTmp,
  getDistinctMovieGenresAsTmp,
  getDistinctMovieNamesAsTmp,
  getReferencesBlock,
} from "@/flix-agent/utils.js";
import {
  agentPrompt,
  byCinemaPrompt,
  byGenrePrompt,
  byMovieNamePrompt,
  byTheHourPrompt,
  byZonePrompt,
} from "@/flix-agent/prompt-templates.js";
import { ChatAnthropicSingleton } from "@/flix-agent/models.js";
import { tools } from "@/flix-agent/tools.js";

/**
 * Takes the user query and saves as current question.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */

export async function initNode(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---INIT NODE---");
  const { messages } = state;
  const lastHumanMsg = messages.filter((msg) => isHumanMessage(msg)).at(-1);
  if (!lastHumanMsg) {
    return {
      currentQuestion: undefined,
    };
  }
  return {
    currentQuestion: lastHumanMsg.text,
  };
}

export async function byCinema(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---BY CINEMA NODE---");
  const userQuery = state.currentQuestion;
  const cinemas = await getCinemaNamesAsTmp();
  const prompt = byCinemaPrompt;
  const byCinemaSchema = z.object({
    cinemaRef: z
      .string()
      .nullable()
      .describe("Cinema name extracted from the user query/intent"),
  });
  const model =
    ChatAnthropicSingleton.getInstance().withStructuredOutput(byCinemaSchema);
  const chain = prompt.pipe(model);
  const byCinemaAIMsg = await chain.invoke({
    userQuery,
    cinemas,
  });
  return {
    chosenCinema: byCinemaAIMsg,
  };
}

export async function byZone(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---BY ZONE NODE---");
  const userQuery = state.currentQuestion;
  const addresses = await getCinemasAddressAsTmp();
  const prompt = byZonePrompt;
  const byZoneSchema = z.object({
    zoneRef: z
      .array(z.string())
      .describe("Matched cinema addresses from the user query/intent"),
  });
  const model =
    ChatAnthropicSingleton.getInstance().withStructuredOutput(byZoneSchema);
  const chain = prompt.pipe(model);
  const byZoneAIMsg = await chain.invoke({
    userQuery,
    addresses,
  });
  return {
    chosenZone: byZoneAIMsg,
  };
}

export async function byMovieName(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---BY MOVIE NAME NODE---");
  const userQuery = state.currentQuestion;
  const movieNames = await getDistinctMovieNamesAsTmp();
  const prompt = byMovieNamePrompt;
  const byMovieNameSchema = z.object({
    movieNameRef: z
      .array(z.string())
      .describe("Movie name extracted from the user query/intent"),
  });
  const model =
    ChatAnthropicSingleton.getInstance().withStructuredOutput(
      byMovieNameSchema
    );
  const chain = prompt.pipe(model);
  const byMovieNameAIMsg = await chain.invoke({
    userQuery,
    movieNames,
  });
  return {
    chosenMovieName: byMovieNameAIMsg,
  };
}

export async function byTheHour(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---BY THE HOUR NODE---");
  const userQuery = state.currentQuestion;
  const prompt = byTheHourPrompt;
  const byTheHourSchema = z.object({
    timeReference: z
      .string()
      .nullable()
      .describe("Time reference extracted from the user query/intent"),
  });
  const model =
    ChatAnthropicSingleton.getInstance().withStructuredOutput(byTheHourSchema);
  const chain = prompt.pipe(model);
  const byTheHourAIMsg = await chain.invoke({
    userQuery,
  });
  return {
    chosenTime: byTheHourAIMsg,
  };
}

export async function byGenre(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---BY GENRE NODE---");
  const userQuery = state.currentQuestion;
  const genres = await getDistinctMovieGenresAsTmp();
  const prompt = byGenrePrompt;
  const byGenreSchema = z.object({
    genreRef: z
      .array(z.string())
      .describe("Movie genre extracted from the user query/intent"),
  });
  const model =
    ChatAnthropicSingleton.getInstance().withStructuredOutput(byGenreSchema);
  const chain = prompt.pipe(model);
  const byGenreAIMsg = await chain.invoke({
    userQuery,
    genres,
  });
  return {
    chosenGenre: byGenreAIMsg,
  };
}

export async function agent(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---AGENT NODE---");
  const references = getReferencesBlock(state);
  const messages = state.messages;
  const prompt = agentPrompt;
  const modelWithTools = ChatAnthropicSingleton.getInstance().bindTools(tools);
  const chain = prompt.pipe(modelWithTools);
  const response = await chain.invoke({
    messages,
    references,
  });

  return {
    messages: [response],
  };
}
