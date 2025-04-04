import { GraphState } from '@agents/movie-recommendations/graph-state';
import { END } from '@langchain/langgraph';

export function shouldContinue(state: typeof GraphState.State) {
  const { messages } = state;
  const lastMsg = messages.at(-1);
  if (!lastMsg) {
    throw new Error('No messages found in the state');
  }
  if (
    'tool_calls' in lastMsg &&
    Array.isArray(lastMsg.tool_calls) &&
    lastMsg.tool_calls.length > 0
  ) {
    return 'tools';
  }
  return END;
}
