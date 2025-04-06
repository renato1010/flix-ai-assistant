"use server";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { GraphState } from "@/flix-agent/graph-state.js";
import {
  byCinema,
  byMovieName,
  byTheHour,
  byZone,
  byGenre,
  initNode,
  agent,
} from "@/flix-agent/nodes.js";
import { shouldContinue } from "@/flix-agent/edges.js";
import { tools } from "@/flix-agent/tools.js";

const toolNodeForGraph = new ToolNode(tools);
// Define the Graph
const workflow = new StateGraph(GraphState)
  // Define the nodes & edges
  .addNode("init", initNode)
  .addEdge(START, "init")
  .addNode("byCinema", byCinema)
  .addNode("byZone", byZone)
  .addNode("byMovieName", byMovieName)
  .addNode("byTheHour", byTheHour)
  .addNode("byGenre", byGenre)
  .addNode("agent", agent)
  .addNode("tools", toolNodeForGraph)
  .addEdge("init", "byCinema")
  .addEdge("init", "byZone")
  .addEdge("init", "byMovieName")
  .addEdge("init", "byTheHour")
  .addEdge("init", "byGenre")
  .addEdge("byCinema", "agent")
  .addEdge("byZone", "agent")
  .addEdge("byMovieName", "agent")
  .addEdge("byTheHour", "agent")
  .addEdge("byGenre", "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END]);

export const graph = workflow.compile();

// TODO: remove this before deploying
// (async () => {
//   // print the graph diagram
//   const representation = graph.getGraphAsync();
//   const image = await (await representation).drawMermaidPng();
//   const arrayBuffer = await image.arrayBuffer();
//   await writeFile(__dirname + '/graph.png', Buffer.from(arrayBuffer));
// })();

// (async () => {
//   const inputs = {
//     messages: [new HumanMessage("Que cines exhiben la pelicula rey leon?")],
//   };

//   /* Iterating the asyncIterable */
//   for await (const value of await graph.stream(inputs, {
//     streamMode: "updates",
//   })) {
//     // const encoder = new TextEncoder();
//     const chunk = JSON.parse(JSON.stringify(value));
//     const isAgent = isAgentChunk(chunk);
//     if (isAgent) {
//       const lastMessage: BaseMessage | undefined = chunk.agent.messages.at(-1);
//       // console.dir({ lastMessage }, { depth: Infinity });
//       // @ts-expect-error(kwargs is a field in lastmessage)
//       const content = lastMessage.kwargs.content as MessageContent;
//       if (typeof content === "string") {
//         console.dir({ content }, { depth: Infinity });
//       } else {
//         if (Array.isArray(content)) {
//           const msgContentText = content.find(isMessageContentText);
//           if (msgContentText) {
//             console.dir({ text: msgContentText.text }, { depth: Infinity });
//           }
//         }
//       }
//     }
//   }
// })().catch((err) => {
//   console.error("Error: ", err);
// });

// (async () => {
//   const messageWithSingleToolCall = new AIMessage({
//     content: '',
//     tool_calls: [
//       {
//         name: 'getMovieTheatersShowing',
//         args: {
//           movieTitle: 'Blanca Nieves'
//         },
//         id: 'tool_call_id',
//         type: 'tool_call'
//       }
//     ]
//   });

//   const toolUse = await toolNodeForGraph.invoke({
//     messages: [messageWithSingleToolCall]
//   });
//   console.dir({ toolUse }, { depth: Infinity });
// })();
