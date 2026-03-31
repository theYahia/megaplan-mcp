#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTasksSchema, handleGetTasks, createTaskSchema, handleCreateTask } from "./tools/tasks.js";
import { getDealsSchema, handleGetDeals, createDealSchema, handleCreateDeal } from "./tools/deals.js";
import { getProjectsSchema, handleGetProjects } from "./tools/projects.js";
import { getEmployeesSchema, handleGetEmployees } from "./tools/employees.js";
import { getCommentsSchema, handleGetComments, createCommentSchema, handleCreateComment } from "./tools/comments.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "megaplan-mcp",
    version: "1.1.0",
  });

  // ── Tasks ──
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

  // ── Deals ──
  server.tool(
    "get_deals",
    "List deals from Megaplan with filters by status, responsible user, and search.",
    getDealsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetDeals(params) }] }),
  );

  server.tool(
    "create_deal",
    "Create a new deal in Megaplan with name, pipeline, responsible user, and amount.",
    createDealSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateDeal(params) }] }),
  );

  // ── Projects ──
  server.tool(
    "get_projects",
    "List projects from Megaplan with filters by status and search.",
    getProjectsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetProjects(params) }] }),
  );

  // ── Employees ──
  server.tool(
    "get_employees",
    "List employees from Megaplan with search and department filter.",
    getEmployeesSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetEmployees(params) }] }),
  );

  // ── Comments ──
  server.tool(
    "get_comments",
    "List comments for a task, deal, or project in Megaplan.",
    getCommentsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetComments(params) }] }),
  );

  server.tool(
    "create_comment",
    "Add a comment to a task, deal, or project in Megaplan.",
    createCommentSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateComment(params) }] }),
  );

  // ── Skills (prompts) ──
  server.prompt(
    "my-tasks-today",
    "Мои задачи на сегодня — shows your tasks due today or overdue",
    {},
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Используй get_tasks с filter_status='active' чтобы получить мои активные задачи. Покажи список задач с дедлайнами, отсортируй по срочности. Если задача просрочена — отметь. Формат: компактная таблица с колонками: Задача, Дедлайн, Статус, Приоритет.",
          },
        },
      ],
    }),
  );

  server.prompt(
    "create-deal-wizard",
    "Создай сделку — guided deal creation wizard",
    {},
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Помоги создать новую сделку в Мегаплане. Спроси у меня: 1) Название сделки, 2) ID программы (pipeline), 3) Ответственный (опционально), 4) Сумма (опционально), 5) Описание (опционально). После сбора данных вызови create_deal.",
          },
        },
      ],
    }),
  );

  return server;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--http")) {
    const { startHttpServer } = await import("./http.js");
    const port = parseInt(process.env.PORT ?? "3000", 10);
    await startHttpServer(createServer(), port);
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[megaplan-mcp] Server started via stdio. 8 tools, 2 skills available.");
  }
}

main().catch((error) => {
  console.error("[megaplan-mcp] Error:", error);
  process.exit(1);
});
