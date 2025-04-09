"use server";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { GraphState } from "@/flix-agent/graph-state.js";
import { byCinema, byMovieName, byTheHour, byZone, byGenre, initNode, agent } from "@/flix-agent/nodes.js";
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
