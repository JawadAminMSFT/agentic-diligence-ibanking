import { describe, it, expect, beforeEach } from "vitest";
import { EventEmitter } from "node:events";
import type { HarnessEvent, HarnessEventType } from "../../src/events/types.js";

// ---------------------------------------------------------------------------
// Minimal ReplaySession implementation (the replay module doesn't exist yet).
// This serves as both a testable mock and a specification for the future module.
// ---------------------------------------------------------------------------

interface ReplayProgress {
  current: number;
  total: number;
  percentage: number;
}

class ReplaySession extends EventEmitter {
  private events: HarnessEvent[];
  private currentIndex = 0;
  private paused = false;
  private stopped = false;
  private delayMs: number;

  constructor(events: HarnessEvent[], opts?: { delayMs?: number }) {
    super();
    this.events = [...events];
    this.delayMs = opts?.delayMs ?? 10;
  }

  get progress(): ReplayProgress {
    return {
      current: this.currentIndex,
      total: this.events.length,
      percentage:
        this.events.length === 0
          ? 100
          : Math.round((this.currentIndex / this.events.length) * 100),
    };
  }

  async play(): Promise<void> {
    this.stopped = false;
    this.paused = false;

    while (this.currentIndex < this.events.length && !this.stopped) {
      if (this.paused) {
        await new Promise<void>((resolve) => {
          this.once("_resume", resolve);
        });
        if (this.stopped) break;
        continue;
      }

      const event = this.events[this.currentIndex];
      this.emit("event", event);
      this.currentIndex++;
      this.emit("progress", this.progress);

      if (this.currentIndex < this.events.length && !this.stopped) {
        await this.sleep(this.delayMs);
      }
    }

    if (!this.stopped) {
      this.emit("complete");
    }
  }

  pause(): void {
    this.paused = true;
    this.emit("paused");
  }

  resume(): void {
    this.paused = false;
    this.emit("_resume");
    this.emit("resumed");
  }

  stop(): void {
    this.stopped = true;
    this.paused = false;
    this.emit("_resume"); // unblock if paused
    this.emit("stopped");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(
  eventType: HarnessEventType,
  index: number,
): HarnessEvent {
  return {
    eventId: `evt-${index}`,
    eventType,
    timestamp: new Date(Date.now() + index * 1000).toISOString(),
    runId: "run-1",
    actorName: "agent",
    summary: `Event ${index}: ${eventType}`,
    payload: {},
  };
}

function makeSampleRun(): HarnessEvent[] {
  return [
    makeEvent("run.started", 0),
    makeEvent("tool.invoked", 1),
    makeEvent("tool.completed", 2),
    makeEvent("evidence.collected", 3),
    makeEvent("claim.evaluated", 4),
    makeEvent("approval.requested", 5),
    makeEvent("approval.granted", 6),
    makeEvent("memo.updated", 7),
    makeEvent("run.completed", 8),
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReplaySession", () => {
  describe("event emission order", () => {
    it("emits events in the original order", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 1 });
      const received: HarnessEvent[] = [];

      session.on("event", (e: HarnessEvent) => received.push(e));
      await session.play();

      expect(received).toHaveLength(events.length);
      for (let i = 0; i < events.length; i++) {
        expect(received[i].eventId).toBe(events[i].eventId);
        expect(received[i].eventType).toBe(events[i].eventType);
      }
    });

    it("handles empty event list gracefully", async () => {
      const session = new ReplaySession([]);
      let completed = false;
      session.on("complete", () => {
        completed = true;
      });

      await session.play();
      expect(completed).toBe(true);
    });

    it("handles single event", async () => {
      const events = [makeEvent("run.started", 0)];
      const session = new ReplaySession(events, { delayMs: 1 });
      const received: HarnessEvent[] = [];

      session.on("event", (e: HarnessEvent) => received.push(e));
      await session.play();

      expect(received).toHaveLength(1);
      expect(received[0].eventType).toBe("run.started");
    });
  });

  describe("timing", () => {
    it("respects delay between events", async () => {
      const events = [
        makeEvent("run.started", 0),
        makeEvent("tool.invoked", 1),
        makeEvent("run.completed", 2),
      ];
      const delayMs = 50;
      const session = new ReplaySession(events, { delayMs });

      const start = Date.now();
      await session.play();
      const elapsed = Date.now() - start;

      // 2 gaps between 3 events, each ~50ms → expect ~100ms minimum
      // Allow generous tolerance for CI environments
      expect(elapsed).toBeGreaterThanOrEqual(delayMs * 1.5);
    });
  });

  describe("pause / resume", () => {
    it("pauses and resumes event emission", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 20 });
      const received: HarnessEvent[] = [];
      let pausedEmitted = false;
      let resumedEmitted = false;

      session.on("event", (e: HarnessEvent) => {
        received.push(e);
        // Pause after the 3rd event
        if (received.length === 3) {
          session.pause();
        }
      });
      session.on("paused", () => {
        pausedEmitted = true;
      });
      session.on("resumed", () => {
        resumedEmitted = true;
      });

      const playPromise = session.play();

      // Wait a bit for the pause to take effect
      await new Promise((r) => setTimeout(r, 200));
      expect(pausedEmitted).toBe(true);
      expect(received.length).toBe(3);

      // Resume
      session.resume();
      await playPromise;

      expect(resumedEmitted).toBe(true);
      expect(received).toHaveLength(events.length);
    });
  });

  describe("stop", () => {
    it("stops replay and does not emit complete", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 30 });
      const received: HarnessEvent[] = [];
      let completed = false;
      let stoppedEmitted = false;

      session.on("event", (e: HarnessEvent) => {
        received.push(e);
        if (received.length === 2) {
          session.stop();
        }
      });
      session.on("complete", () => {
        completed = true;
      });
      session.on("stopped", () => {
        stoppedEmitted = true;
      });

      await session.play();

      expect(stoppedEmitted).toBe(true);
      expect(completed).toBe(false);
      expect(received.length).toBeLessThan(events.length);
    });

    it("stop while paused resumes and terminates", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 20 });
      const received: HarnessEvent[] = [];

      session.on("event", (e: HarnessEvent) => {
        received.push(e);
        if (received.length === 1) {
          session.pause();
        }
      });

      const playPromise = session.play();

      await new Promise((r) => setTimeout(r, 100));
      expect(received).toHaveLength(1);

      session.stop();
      await playPromise;

      expect(received.length).toBeLessThan(events.length);
    });
  });

  describe("progress tracking", () => {
    it("emits progress after each event", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 1 });
      const progressUpdates: ReplayProgress[] = [];

      session.on("progress", (p: ReplayProgress) => progressUpdates.push(p));
      await session.play();

      expect(progressUpdates).toHaveLength(events.length);

      // First progress: 1/9
      expect(progressUpdates[0].current).toBe(1);
      expect(progressUpdates[0].total).toBe(events.length);

      // Last progress: 9/9 → 100%
      const last = progressUpdates[progressUpdates.length - 1];
      expect(last.current).toBe(events.length);
      expect(last.percentage).toBe(100);
    });

    it("progress is accessible via getter", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 1 });

      expect(session.progress.current).toBe(0);
      expect(session.progress.percentage).toBe(0);

      await session.play();

      expect(session.progress.current).toBe(events.length);
      expect(session.progress.percentage).toBe(100);
    });

    it("empty run reports 100% immediately", () => {
      const session = new ReplaySession([]);
      expect(session.progress.percentage).toBe(100);
    });
  });

  describe("sample run event types", () => {
    it("contains expected event type sequence", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 1 });
      const types: HarnessEventType[] = [];

      session.on("event", (e: HarnessEvent) => types.push(e.eventType));
      await session.play();

      expect(types[0]).toBe("run.started");
      expect(types[types.length - 1]).toBe("run.completed");
      expect(types).toContain("tool.invoked");
      expect(types).toContain("tool.completed");
      expect(types).toContain("evidence.collected");
      expect(types).toContain("approval.requested");
      expect(types).toContain("approval.granted");
      expect(types).toContain("memo.updated");
    });

    it("all emitted events are valid HarnessEvents", async () => {
      const events = makeSampleRun();
      const session = new ReplaySession(events, { delayMs: 1 });
      const received: HarnessEvent[] = [];

      session.on("event", (e: HarnessEvent) => received.push(e));
      await session.play();

      for (const e of received) {
        expect(e).toHaveProperty("eventId");
        expect(e).toHaveProperty("eventType");
        expect(e).toHaveProperty("timestamp");
        expect(e).toHaveProperty("runId");
        expect(e).toHaveProperty("actorName");
        expect(e).toHaveProperty("summary");
        expect(e).toHaveProperty("payload");
      }
    });
  });
});
