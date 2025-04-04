import { BaseMessage, type MessageContentText } from '@langchain/core/messages';

export type JSONObject = {
  [x: string]: JSONValue;
};
type JSONArray = Array<JSONValue> & {};
type JSONValue = string | number | boolean | JSONObject | JSONArray;
type AgentChunk = { agent: { messages: BaseMessage[] } };
type ToolChunk = { tool: { messages: BaseMessage[] } };
export const isAgentChunk = (chunk: AgentChunk): chunk is AgentChunk => {
  return 'agent' in chunk;
};
export const isToolChunk = (chunk: ToolChunk): chunk is ToolChunk => {
  return 'tool' in chunk && 'messages' in chunk.tool;
};
export const isMessageContentText = (
  messageContent: JSONObject
): messageContent is MessageContentText => {
  return messageContent.type === 'text' && 'text' in messageContent;
};
