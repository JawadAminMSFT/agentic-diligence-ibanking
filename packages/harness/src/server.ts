import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import type { Express } from "express";
import type { CopilotSession } from "@github/copilot-sdk";

import { createCopilotClient, loadConfigFromEnv } from "./client.js";
import { createReplayRouter } from "./replay/replay-server.js";
import { createDiligenceSession } from "./session-factory.js";
import { WorkspaceStore } from "./state/store.js";
import { TraceStore } from "./events/trace-store.js";
import { createSessionStore, type SessionStore } from "./db/index.js";
import { createArtifactStore, type ArtifactStore } from "./storage/index.js";
import { AVAILABLE_DEALS } from "./deals.js";
import type { HarnessEvent } from "./events/types.js";
import type { DealWorkspace } from "./state/types.js";
import type { Response as ExpressResponse } from "express";

interface RunState {
  runId: string;
  sessionId: string;
  session: CopilotSession;
  store: WorkspaceStore;
  traceStore: TraceStore;
  sseClients: ExpressResponse[];
}

const runs = new Map<string, RunState>();
let sessionStore: SessionStore;
let artifactStore: ArtifactStore;

export function createServer(): Express {
  sessionStore = createSessionStore();
  artifactStore = createArtifactStore();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Mount replay router first so replay SSE intercepts before live handler
  app.use(createReplayRouter());

  // GET /api/deals — List available deals
  app.get("/api/deals", (_req, res) => {
    res.json(AVAILABLE_DEALS);
  });

  // POST /api/run — Start a new diligence run
  app.post("/api/run", async (req, res) => {
    try {
      const prompt: string = req.body.prompt;
      if (!prompt) {
        res.status(400).json({ error: "prompt is required" });
        return;
      }

      const dealId: string = req.body.dealId ?? "atlas";
      const dealInfo = AVAILABLE_DEALS.find(d => d.dealId === dealId) ?? AVAILABLE_DEALS[0];

      // Build a default workspace if not provided
      const workspace: DealWorkspace = req.body.workspace ?? {
        dealId: dealInfo.dealId,
        codeName: dealInfo.codeName,
        status: "active",
        currentStage: "initial-review",
        dataPackageVersion: "1.0.0",
        claims: [],
        issues: [],
        memoSections: [],
        evidence: [],
        contradictions: [],
        toolHistory: [],
      };

      const harnessConfig = loadConfigFromEnv();
      const client = await createCopilotClient();

      const workspaceStore = new WorkspaceStore(workspace);
      const traceStore = new TraceStore();
      const sseClients: ExpressResponse[] = [];

      const onEvent = (event: HarnessEvent) => {
        traceStore.append(event);
        sessionStore.appendEvent(runId, event);
        console.log(`[event] ${event.eventType}: ${event.summary}`);

        // Update DB status on terminal events
        if (event.eventType === "session.ended" || event.eventType === "run.completed") {
          sessionStore.updateSessionStatus(runId, "completed", traceStore.count());
        } else if (event.eventType === "run.failed") {
          sessionStore.updateSessionStatus(runId, "failed", traceStore.count());
        }

        // Persist artifact content when generated
        if (event.eventType === "artifact.generated") {
          const payload = event.payload as Record<string, unknown>;
          try {
            // The artifact data can be nested in multiple ways depending on how the bridge formats it:
            // 1. payload.result.content = JSON string with {artifactId, filename, content, ...}
            // 2. payload.result.content = raw MCP content array/string
            // 3. payload itself may contain the artifact data
            const result = (payload.result as Record<string, unknown>) ?? {};
            let contentStr = (result.content as string) ?? "";

            // If content is an array (MCP content format), extract text from first element
            if (Array.isArray(result.content)) {
              const first = (result.content as Array<Record<string, unknown>>)[0];
              contentStr = (first?.text as string) ?? "";
            }

            let artifactData: Record<string, unknown> | null = null;

            // Try parsing as JSON
            if (contentStr && (contentStr.startsWith("{") || contentStr.startsWith("["))) {
              try { artifactData = JSON.parse(contentStr); } catch { /* not JSON */ }
            }

            // If JSON parse failed or content wasn't JSON, try to extract from payload directly
            if (!artifactData || !artifactData.filename) {
              // Check if payload has artifact fields directly
              if (payload.filename && payload.content) {
                artifactData = payload;
              } else if (result.filename && result.content) {
                artifactData = result;
              }
            }

            if (artifactData) {
              const filename = (artifactData.filename as string) ?? "";
              const htmlContent = (artifactData.content as string) ?? "";

              if (filename && htmlContent && htmlContent.length > 50) {
                artifactStore.write(runId, filename, htmlContent).catch(err => {
                  console.error(`[artifacts] Failed to write ${filename}:`, err);
                });
                console.log(`[artifacts] Saved ${filename} (${htmlContent.length} bytes) for run ${runId}`);
              } else {
                console.warn(`[artifacts] Skipped artifact: filename="${filename}", contentLen=${htmlContent.length}`);
              }
            } else {
              console.warn(`[artifacts] Could not extract artifact data from event`);
            }
          } catch (err) {
            console.error("[artifacts] Failed to parse artifact event:", err);
          }
        }

        for (const sseClient of sseClients) {
          sseClient.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      };

      const { session, sessionId, runId } = await createDiligenceSession(
        client,
        {
          harnessConfig,
          workspace,
          onEvent,
          onApprovalNeeded: (request) => {
            onEvent({
              eventId: uuidv4(),
              eventType: "approval.requested",
              timestamp: new Date().toISOString(),
              runId,
              actorName: "approval-gate",
              summary: `Approval required for ${request.toolName}`,
              payload: request as unknown as Record<string, unknown>,
            });
          },
        }
      );

      const runState: RunState = {
        runId,
        sessionId,
        session,
        store: workspaceStore,
        traceStore,
        sseClients,
      };
      runs.set(runId, runState);

      // Persist session to DB
      sessionStore.saveSession({
        id: sessionId,
        runId,
        dealId: workspace.dealId,
        codeName: workspace.codeName,
        status: "running",
        prompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        eventCount: 0,
      });

      // Start the diligence run in the background
      const diligencePrompt =
        prompt ??
        `Begin due diligence analysis for deal ${workspace.codeName}.`;

      // Fire-and-forget: send the prompt to the session
      session.send({ prompt: diligencePrompt }).catch((err: Error) => {
        console.error(`[server] Run ${runId} failed:`, err);
        onEvent({
          eventId: uuidv4(),
          eventType: "run.failed",
          timestamp: new Date().toISOString(),
          runId,
          actorName: "server",
          summary: `Run failed: ${err.message}`,
          payload: { error: err.message },
        });
      });

      res.json({ runId, sessionId });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // GET /api/run — List all runs
  app.get("/api/run", (_req, res) => {
    const dbSessions = sessionStore.listSessions(50);
    const result = dbSessions.map(s => {
      const liveRun = runs.get(s.runId);
      return {
        runId: s.runId,
        sessionId: s.id,
        dealName: s.codeName,
        status: s.status === "completed" || s.status === "failed" ? s.status : (liveRun ? "running" : s.status),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        eventCount: liveRun ? liveRun.traceStore.count() : s.eventCount,
      };
    });
    res.json(result);
  });

  // GET /api/run/:runId/events/json — JSON snapshot of all events (non-SSE)
  app.get("/api/run/:runId/events/json", (req, res) => {
    const run = runs.get(req.params.runId);
    if (run) {
      res.json(run.traceStore.list());
      return;
    }
    // Fall back to DB for completed runs
    const dbEvents = sessionStore.getEvents(req.params.runId);
    if (dbEvents.length > 0) {
      res.json(dbEvents);
      return;
    }
    res.status(404).json({ error: "Run not found" });
  });

  // GET /api/run/:runId/events — SSE endpoint for real-time events
  app.get("/api/run/:runId/events", (req, res) => {
    const run = runs.get(req.params.runId);

    // If run not in memory, try loading from DB
    if (!run) {
      const dbEvents = sessionStore.getEvents(req.params.runId);
      if (dbEvents.length > 0) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        for (const event of dbEvents) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        res.end();
        return;
      }
      res.status(404).json({ error: "Run not found" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Send existing events as replay
    for (const event of run.traceStore.list()) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    run.sseClients.push(res);

    req.on("close", () => {
      const idx = run.sseClients.indexOf(res);
      if (idx >= 0) run.sseClients.splice(idx, 1);
    });
  });

  // POST /api/run/:runId/steer — Send a steering message
  app.post("/api/run/:runId/steer", async (req, res) => {
    const run = runs.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Run not found (may have completed — steering only works on active runs)" });
      return;
    }

    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    // Emit a user steering event so it appears in the timeline
    const steerEvent: HarnessEvent = {
      eventId: uuidv4(),
      eventType: "steer.sent",
      timestamp: new Date().toISOString(),
      runId: run.runId,
      actorName: "user",
      summary: message,
      payload: { message },
    };
    run.traceStore.append(steerEvent);
    sessionStore.appendEvent(run.runId, steerEvent);
    for (const sseClient of run.sseClients) {
      sseClient.write(`data: ${JSON.stringify(steerEvent)}\n\n`);
    }

    try {
      await run.session.send({ prompt: message });
      res.json({ status: "steered" });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /api/run/:runId/queue — Queue a message
  app.post("/api/run/:runId/queue", async (req, res) => {
    const run = runs.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    try {
      await run.session.send({ prompt: message });
      res.json({ status: "queued" });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /api/run/:runId/approve — Approve or reject a pending action
  app.post("/api/run/:runId/approve", async (req, res) => {
    const run = runs.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const { approved, toolName, actionId } = req.body;
    const eventType = approved ? "approval.granted" : "approval.denied";
    const label = toolName ?? actionId ?? "unknown";

    const event: HarnessEvent = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      runId: run.runId,
      actorName: "human",
      summary: `${approved ? "Approved" : "Denied"}: ${label}`,
      payload: { approved, toolName: label, actionId },
    };

    run.traceStore.append(event);
    for (const sseClient of run.sseClients) {
      sseClient.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.json({ status: eventType });
  });

  // GET /api/run/:runId/artifacts/status — Check if artifacts exist for a run
  app.get("/api/run/:runId/artifacts/status", async (req, res) => {
    const artifacts = await artifactStore.list(req.params.runId);
    const count = artifacts.filter(a =>
      a.format === "html" || a.format === "pdf" || a.format === "pptx" || a.format === "json"
    ).length;
    res.json({ hasArtifacts: count > 0, count });
  });

  // GET /api/run/:runId/artifacts — List artifacts for a run
  app.get("/api/run/:runId/artifacts", async (req, res) => {
    const artifacts = await artifactStore.list(req.params.runId);
    res.json(artifacts.map(a => ({
      ...a,
      url: `/api/run/${req.params.runId}/artifacts/${a.filename}`,
    })));
  });

  // GET /api/run/:runId/artifacts/:filename — Serve an artifact file
  app.get("/api/run/:runId/artifacts/:filename", async (req, res) => {
    const { runId, filename } = req.params;
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "");
    const ext = sanitized.split(".").pop()?.toLowerCase() ?? "";

    const contentTypes: Record<string, string> = {
      html: "text/html",
      md: "text/markdown",
      pdf: "application/pdf",
      json: "application/json",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    // Serve directly from filesystem to handle binary files (pdf, pptx) correctly
    const artifactsDir = path.resolve(process.cwd(), "artifacts", runId);
    const filePath = path.join(artifactsDir, sanitized);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Artifact not found" });
      return;
    }

    res.setHeader("Content-Type", contentTypes[ext] ?? "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${sanitized}"`);

    // Use sendFile for all types (handles binary correctly)
    res.sendFile(filePath);
  });

  // GET /api/run/:runId/dashboard-data — Serve the dashboard JSON data
  app.get("/api/run/:runId/dashboard-data", (req, res) => {
    const { runId } = req.params;
    const artifactsDir = path.resolve(process.cwd(), "artifacts", runId);
    const filePath = path.join(artifactsDir, "dashboard-data.json");

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Dashboard data not found" });
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(data);
    } catch {
      res.status(500).json({ error: "Failed to parse dashboard data" });
    }
  });

  // GET /api/sessions — List all runs/sessions
  app.get("/api/sessions", (_req, res) => {
    const sessions = sessionStore.listSessions(50);
    res.json(sessions.map(s => ({
      runId: s.runId,
      sessionId: s.id,
      dealName: s.codeName,
      status: s.status === "completed" || s.status === "failed" ? s.status : (runs.has(s.runId) ? "running" : s.status),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      eventCount: s.eventCount,
    })));
  });

  return app;
}

export function startServer(port = 3000): Express {
  const app = createServer();
  app.listen(port, () => {
    console.log(`[server] Diligence Harness API listening on port ${port}`);
  });
  return app;
}
