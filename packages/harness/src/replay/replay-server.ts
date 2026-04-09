import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import type { Response as ExpressResponse } from "express";

import { TraceStore } from "../events/trace-store.js";
import type { HarnessEvent } from "../events/types.js";
import { ReplaySession, loadEventsFromJsonl } from "./replayer.js";
import { sampleRunEvents } from "./sample-run.js";

interface ReplayRunState {
  runId: string;
  sessionId: string;
  traceStore: TraceStore;
  replay: ReplaySession;
  sseClients: ExpressResponse[];
}

const replayRuns = new Map<string, ReplayRunState>();

/**
 * Create an Express router that adds replay endpoints.
 * Mount with `app.use(createReplayRouter())` in the main server.
 */
export function createReplayRouter(): Router {
  const router = Router();

  // GET /api/replay — Browser-friendly: auto-starts a replay and redirects to info
  router.get("/api/replay", (_req, res) => {
    const runId = `replay-${uuidv4().slice(0, 8)}`;
    const sessionId = `session-${uuidv4().slice(0, 8)}`;
    const traceStore = new TraceStore();
    const sseClients: ExpressResponse[] = [];

    const rewrittenEvents = sampleRunEvents.map((e) => ({ ...e, runId }));
    const replay = new ReplaySession(rewrittenEvents, 5);

    const runState: ReplayRunState = { runId, sessionId, traceStore, replay, sseClients };
    replayRuns.set(runId, runState);

    replay.start((event) => {
      traceStore.append(event);
      for (const client of sseClients) {
        client.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    });

    res.json({ runId, sessionId, totalEvents: rewrittenEvents.length, sseUrl: `/api/run/${runId}/events` });
  });

  // POST /api/replay — Start a replay run from sample data or a JSONL file
  router.post("/api/replay", (req, res) => {
    try {
      const { filePath, speedMultiplier } = req.body ?? {};
      const speed = typeof speedMultiplier === "number" ? speedMultiplier : 5;

      let events: HarnessEvent[];
      if (typeof filePath === "string" && filePath.length > 0) {
        events = loadEventsFromJsonl(filePath);
      } else {
        events = sampleRunEvents;
      }

      const runId = `replay-${uuidv4().slice(0, 8)}`;
      const sessionId = `session-${uuidv4().slice(0, 8)}`;
      const traceStore = new TraceStore();
      const sseClients: ExpressResponse[] = [];

      // Rewrite events to use the new runId so the frontend sees a consistent run
      const rewrittenEvents = events.map((e) => ({ ...e, runId }));

      const replay = new ReplaySession(rewrittenEvents, speed);

      const runState: ReplayRunState = {
        runId,
        sessionId,
        traceStore,
        replay,
        sseClients,
      };
      replayRuns.set(runId, runState);

      // Start replaying — each emitted event is stored and pushed to SSE clients
      replay.start((event) => {
        traceStore.append(event);
        for (const client of sseClients) {
          client.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      });

      res.json({ runId, sessionId, totalEvents: rewrittenEvents.length });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /api/replay/:runId/pause
  router.post("/api/replay/:runId/pause", (req, res) => {
    const run = replayRuns.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Replay run not found" });
      return;
    }
    run.replay.pause();
    res.json({ status: "paused", progress: run.replay.getProgress() });
  });

  // POST /api/replay/:runId/resume
  router.post("/api/replay/:runId/resume", (req, res) => {
    const run = replayRuns.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Replay run not found" });
      return;
    }
    run.replay.resume();
    res.json({ status: "resumed", progress: run.replay.getProgress() });
  });

  // POST /api/replay/:runId/stop
  router.post("/api/replay/:runId/stop", (req, res) => {
    const run = replayRuns.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Replay run not found" });
      return;
    }
    run.replay.stop();
    res.json({ status: "stopped", progress: run.replay.getProgress() });
  });

  // GET /api/replay/:runId/progress
  router.get("/api/replay/:runId/progress", (req, res) => {
    const run = replayRuns.get(req.params.runId);
    if (!run) {
      res.status(404).json({ error: "Replay run not found" });
      return;
    }
    res.json(run.replay.getProgress());
  });

  // POST /api/run/:runId/approve — Handle approval for replay runs
  router.post("/api/run/:runId/approve", (req, res, next) => {
    const run = replayRuns.get(req.params.runId);
    if (!run) {
      next();
      return;
    }

    const { approved, toolName, actionId } = req.body;
    const eventType = approved ? "approval.granted" : "approval.denied";
    const label = toolName ?? actionId ?? "unknown";

    const event: HarnessEvent = {
      eventId: `evt-${Date.now()}`,
      eventType,
      timestamp: new Date().toISOString(),
      runId: run.runId,
      actorName: "human",
      summary: `${approved ? "Approved" : "Denied"}: ${label}`,
      payload: { approved, toolName: label, actionId } as Record<string, unknown>,
    };

    run.traceStore.append(event);
    for (const client of run.sseClients) {
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.json({ status: eventType });
  });

  // GET /api/run/:runId/events — SSE for replay runs (intercepts before the live handler)
  router.get("/api/run/:runId/events", (req, res, next) => {
    const run = replayRuns.get(req.params.runId);
    if (!run) {
      // Not a replay run — fall through to the live handler
      next();
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Send any already-emitted events
    for (const event of run.traceStore.list()) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    run.sseClients.push(res);

    req.on("close", () => {
      const idx = run.sseClients.indexOf(res);
      if (idx >= 0) run.sseClients.splice(idx, 1);
    });
  });

  return router;
}
