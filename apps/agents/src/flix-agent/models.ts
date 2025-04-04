import { ChatAnthropic } from "@langchain/anthropic";
import {
  ChatOpenAI,
  OpenAIBaseInput,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { anthropicSecretKey, openaiSecretKey } from "@/flix-agent/keys.js";

// create a singleton of ChatAnthropic Class
export class ChatAnthropicSingleton {
  private static instance: ChatAnthropic;

  private constructor() {} // Prevent direct construction

  static getInstance(): ChatAnthropic {
    if (!ChatAnthropicSingleton.instance) {
      ChatAnthropicSingleton.instance = new ChatAnthropic({
        model: "claude-3-5-sonnet-latest",
        apiKey: anthropicSecretKey,
        temperature: 0,
      });
    }
    return ChatAnthropicSingleton.instance;
  }
}
// OPENAI MODELS
// create a singleton for OpenAIEmbeddings Class Model
export class OpenAIEmbeddingsSingleton {
  private static instance: OpenAIEmbeddings;
  private constructor() {} // Prevent direct construction
  static getInstance(): OpenAIEmbeddings {
    if (!OpenAIEmbeddingsSingleton.instance) {
      OpenAIEmbeddingsSingleton.instance = new OpenAIEmbeddings({
        apiKey: openaiSecretKey,
      });
    }
    return OpenAIEmbeddingsSingleton.instance;
  }
}
// create a singleton of ChatOpenAI Class
export class ChatOpenAISingleton {
  private static instance: ChatOpenAI;

  private constructor() {} // Prevent direct construction

  static getInstance(extraOptions?: Partial<OpenAIBaseInput>): ChatOpenAI {
    if (!ChatOpenAISingleton.instance) {
      ChatOpenAISingleton.instance = new ChatOpenAI({
        model: "gpt-4o",
        apiKey: openaiSecretKey,
        temperature: 0,
        ...extraOptions,
      });
    }
    return ChatOpenAISingleton.instance;
  }
}
