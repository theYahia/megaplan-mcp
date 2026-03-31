#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTasksSchema, handleGetTasks, createTaskSchema, handleCreateTask } from "./tools/tasks.js";
import { getDealsSchema, handleGetDeals } from "./tools/deals.js";

const server = new McpServer({
  name: "megaplan-mcp",
  version: "1.0.0",
});

server.tool(
  "get_tasks",
  "List tasks from Megaplan with filters by status, responsible user, and search.",
  getTasksSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetTasks(params) }] }),
);

server.tool(
  "create_task",
  "Create a new task in Megaplan with name, description, responsible user, and deadline.",
  createTaskSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateTask(params) }] }),
);

server.tool(
  "get_deals",
  "List deals from Megaplan with filters by status, responsible user, and search.",
  getDealsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetDeals(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[megaplan-mcp] Server started. 3 tools available.");
}

main().catch((error) => {
  console.error("[megaplan-mcp] Error:", error);
  process.exit(1);
});
