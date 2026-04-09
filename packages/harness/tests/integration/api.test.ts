import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import type { Express } from "express";

// ---------------------------------------------------------------------------
// Mock external dependencies that require Azure OpenAI credentials
// ---------------------------------------------------------------------------

vi.mock("../../src/client.js", () => ({
  loadConfigFromEnv: () => ({
    modelName: "test-model",
    endpoint: "https://test.openai.azure.com",
    apiKey: "test-key",
  }),
  createCopilotClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../src/session-factory.js", () => {
  let callCount = 0;
  return {
    createDiligenceSession: vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        session: { send: vi.fn().mockResolvedValue(undefined) },
        sessionId: `mock-session-${callCount}`,
        runId: `mock-run-${callCount}`,
      };
    }),
  };
});

import { createServer } from "../../src/server.js";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const validWorkspace = {
  dealId: "deal-test",
  codeName: "TestDeal",
  status: "active",
  currentStage: "initial",
  dataPackageVersion: "1.0",
  claims: [],
  issues: [],
  memoSections: [],
  evidence: [],
  contradictions: [],
  toolHistory: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("API Server Integration", () => {
  let app: Express;

  beforeAll(() => {
    app = createServer();
  });

  // --- POST /api/run -------------------------------------------------------

  describe("POST /api/run — validation", () => {
    it("rejects request with no workspace", async () => {
      const res = await request(app).post("/api/run").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/dealId/i);
    });

    it("rejects workspace missing dealId", async () => {
      const res = await request(app)
        .post("/api/run")
        .send({ workspace: { codeName: "NoDealId" } });
      expect(res.status).toBe(400);
    });

    it("creates a run with valid workspace", async () => {
      const res = await request(app)
        .post("/api/run")
        .send({ workspace: validWorkspace });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("runId");
      expect(res.body).toHaveProperty("sessionId");
    });
  });

  // --- GET /api/sessions ---------------------------------------------------

  describe("GET /api/sessions", () => {
    it("returns sessions array", async () => {
      const res = await request(app).get("/api/sessions");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
    });

    it("includes run created earlier", async () => {
      const res = await request(app).get("/api/sessions");
      expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);
      const session = res.body.sessions[0];
      expect(session).toHaveProperty("runId");
      expect(session).toHaveProperty("sessionId");
      expect(session).toHaveProperty("eventCount");
      expect(typeof session.eventCount).toBe("number");
    });
  });

  // --- POST /api/run/:runId/approve ----------------------------------------

  describe("POST /api/run/:runId/approve", () => {
    it("returns 404 for unknown run", async () => {
      const res = await request(app)
        .post("/api/run/no-such-run/approve")
        .send({ approved: true, toolName: "test-tool" });
      expect(res.status).toBe(404);
    });

    it("grants approval and returns approval.granted", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-approve-g" } });
      const { runId } = createRes.body;

      const res = await request(app)
        .post(`/api/run/${runId}/approve`)
        .send({ approved: true, toolName: "web_research.search" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("approval.granted");
    });

    it("denies approval and returns approval.denied", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-approve-d" } });
      const { runId } = createRes.body;

      const res = await request(app)
        .post(`/api/run/${runId}/approve`)
        .send({ approved: false, toolName: "workflow.draft_seller_question" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("approval.denied");
    });

    it("approval events increment trace event count", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-approve-t" } });
      const { runId } = createRes.body;

      // Approve twice
      await request(app)
        .post(`/api/run/${runId}/approve`)
        .send({ approved: true, toolName: "vdr.read_document" });
      await request(app)
        .post(`/api/run/${runId}/approve`)
        .send({ approved: false, toolName: "memo.write_section" });

      const sessionsRes = await request(app).get("/api/sessions");
      const session = sessionsRes.body.sessions.find(
        (s: { runId: string }) => s.runId === runId,
      );
      expect(session).toBeDefined();
      expect(session.eventCount).toBeGreaterThanOrEqual(2);
    });
  });

  // --- POST /api/run/:runId/steer ------------------------------------------

  describe("POST /api/run/:runId/steer", () => {
    it("returns 404 for unknown run", async () => {
      const res = await request(app)
        .post("/api/run/no-such-run/steer")
        .send({ message: "focus on financials" });
      expect(res.status).toBe(404);
    });

    it("rejects missing message", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-steer-v" } });
      const { runId } = createRes.body;

      const res = await request(app)
        .post(`/api/run/${runId}/steer`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/message/i);
    });

    it("accepts valid steer message", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-steer-ok" } });
      const { runId } = createRes.body;

      const res = await request(app)
        .post(`/api/run/${runId}/steer`)
        .send({ message: "focus on financial analysis" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("steered");
    });
  });

  // --- POST /api/run/:runId/queue ------------------------------------------

  describe("POST /api/run/:runId/queue", () => {
    it("returns 404 for unknown run", async () => {
      const res = await request(app)
        .post("/api/run/no-such-run/queue")
        .send({ message: "test" });
      expect(res.status).toBe(404);
    });

    it("rejects missing message", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-queue-v" } });
      const { runId } = createRes.body;

      const res = await request(app)
        .post(`/api/run/${runId}/queue`)
        .send({});
      expect(res.status).toBe(400);
    });

    it("accepts valid queue message", async () => {
      const createRes = await request(app)
        .post("/api/run")
        .send({ workspace: { ...validWorkspace, dealId: "deal-queue-ok" } });
      const { runId } = createRes.body;

      const res = await request(app)
        .post(`/api/run/${runId}/queue`)
        .send({ message: "check retention metrics" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("queued");
    });
  });

  // --- GET /api/run/:runId/events (SSE) ------------------------------------

  describe("GET /api/run/:runId/events", () => {
    it("returns 404 for unknown run", async () => {
      const res = await request(app).get("/api/run/no-such-run/events");
      expect(res.status).toBe(404);
    });
  });
});
