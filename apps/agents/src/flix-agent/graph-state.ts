import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  Messages,
  messagesStateReducer,
} from "@langchain/langgraph";

// agent state
export const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[], Messages>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  chosenCinema: Annotation<{
    cinemaRef: string | null;
  }>({
    reducer: (_x, y) => y,
    default: () => ({
      cinemaRef: null,
    }),
  }),
  chosenMovieName: Annotation<{ movieNameRef: string[] }>({
    reducer: (_x, y) => y,
    default: () => ({ movieNameRef: [] }),
  }),
  chosenZone: Annotation<{ zoneRef: string[] }>({
    reducer: (_x, y) => y,
    default: () => ({ zoneRef: [] }),
  }),
  chosenTime: Annotation<{ timeReference: string | null }>({
    reducer: (_x, y) => y,
    default: () => ({ timeReference: null }),
  }),
  chosenGenre: Annotation<{ genreRef: string[] }>({
    reducer: (_x, y) => y,
    default: () => ({ genreRef: [] }),
  }),
  currentQuestion: Annotation<BaseMessage["content"]>({
    reducer: (x, y) => (y ? y : x),
    default: () => "",
  }),
});
