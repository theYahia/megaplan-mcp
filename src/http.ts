import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";

export async function startHttpServer(server: McpServer, port: number): Promise<void> {
  const app = express();
  app.use(express.json());

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }

    const newSessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
    });

    transports.set(newSessionId, transport);
    transport.onclose = () => transports.delete(newSessionId);

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).json({ error: "No valid session. POST /mcp first." });
      return;
    }
    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res);
      transports.delete(sessionId);
    } else {
      res.status(200).end();
    }
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", tools: 8, skills: 2, sessions: transports.size });
  });

  app.listen(port, () => {
    console.error(`[megaplan-mcp] HTTP server on http://localhost:${port}/mcp (Streamable HTTP)`);
    console.error(`[megaplan-mcp] Health: http://localhost:${port}/health`);
  });
}
