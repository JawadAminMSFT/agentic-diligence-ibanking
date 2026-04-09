import { describe, it, expect } from "vitest";
import { TraceStore } from "../src/events/trace-store.js";
import type { HarnessEvent } from "../src/events/types.js";

function makeEvent(overrides?: Partial<HarnessEvent>): HarnessEvent {
  return {
    eventId: "evt-1",
    eventType: "tool.invoked",
    timestamp: "2024-01-15T10:00:00Z",
    runId: "run-1",
    actorName: "agent-1",
    summary: "Invoked tool",
    payload: {},
    ...overrides,
  };
}

describe("TraceStore", () => {
  it("starts empty", () => {
    const store = new TraceStore();
    expect(store.list()).toHaveLength(0);
    expect(store.count()).toBe(0);
  });

  describe("append", () => {
    it("can append events", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1" }));
      store.append(makeEvent({ eventId: "evt-2" }));

      expect(store.list()).toHaveLength(2);
      expect(store.count()).toBe(2);
    });
  });

  describe("list", () => {
    it("returns all events when no filter", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1" }));
      store.append(makeEvent({ eventId: "evt-2" }));

      const events = store.list();
      expect(events).toHaveLength(2);
    });

    it("returns a copy, not the internal array", () => {
      const store = new TraceStore();
      store.append(makeEvent());

      const list = store.list();
      list.pop();
      expect(store.list()).toHaveLength(1);
    });
  });

  describe("filter", () => {
    it("filters by runId", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1", runId: "run-1" }));
      store.append(makeEvent({ eventId: "evt-2", runId: "run-2" }));

      const filtered = store.list({ runId: "run-1" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].runId).toBe("run-1");
    });

    it("filters by eventType", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1", eventType: "tool.invoked" }));
      store.append(
        makeEvent({ eventId: "evt-2", eventType: "tool.completed" })
      );
      store.append(makeEvent({ eventId: "evt-3", eventType: "tool.invoked" }));

      const filtered = store.list({ eventType: "tool.invoked" });
      expect(filtered).toHaveLength(2);
    });

    it("filters by actorName", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1", actorName: "agent-1" }));
      store.append(makeEvent({ eventId: "evt-2", actorName: "agent-2" }));

      const filtered = store.list({ actorName: "agent-2" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].actorName).toBe("agent-2");
    });

    it("filters by since/until time range", () => {
      const store = new TraceStore();
      store.append(
        makeEvent({ eventId: "evt-1", timestamp: "2024-01-01T00:00:00Z" })
      );
      store.append(
        makeEvent({ eventId: "evt-2", timestamp: "2024-06-15T00:00:00Z" })
      );
      store.append(
        makeEvent({ eventId: "evt-3", timestamp: "2024-12-31T00:00:00Z" })
      );

      const filtered = store.list({
        since: "2024-03-01T00:00:00Z",
        until: "2024-09-01T00:00:00Z",
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].eventId).toBe("evt-2");
    });

    it("combines multiple filters", () => {
      const store = new TraceStore();
      store.append(
        makeEvent({
          eventId: "evt-1",
          runId: "run-1",
          eventType: "tool.invoked",
        })
      );
      store.append(
        makeEvent({
          eventId: "evt-2",
          runId: "run-1",
          eventType: "tool.completed",
        })
      );
      store.append(
        makeEvent({
          eventId: "evt-3",
          runId: "run-2",
          eventType: "tool.invoked",
        })
      );

      const filtered = store.list({
        runId: "run-1",
        eventType: "tool.invoked",
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].eventId).toBe("evt-1");
    });
  });

  describe("toJSONL", () => {
    it("produces valid JSONL", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1" }));
      store.append(makeEvent({ eventId: "evt-2" }));

      const jsonl = store.toJSONL();
      const lines = jsonl.split("\n");
      expect(lines).toHaveLength(2);

      const parsed0 = JSON.parse(lines[0]);
      expect(parsed0.eventId).toBe("evt-1");

      const parsed1 = JSON.parse(lines[1]);
      expect(parsed1.eventId).toBe("evt-2");
    });

    it("produces empty string for no events", () => {
      const store = new TraceStore();
      expect(store.toJSONL()).toBe("");
    });

    it("respects filters in JSONL output", () => {
      const store = new TraceStore();
      store.append(makeEvent({ eventId: "evt-1", runId: "run-1" }));
      store.append(makeEvent({ eventId: "evt-2", runId: "run-2" }));

      const jsonl = store.toJSONL({ runId: "run-1" });
      const lines = jsonl.split("\n");
      expect(lines).toHaveLength(1);

      const parsed = JSON.parse(lines[0]);
      expect(parsed.runId).toBe("run-1");
    });
  });

  describe("clear", () => {
    it("removes all events", () => {
      const store = new TraceStore();
      store.append(makeEvent());
      store.append(makeEvent({ eventId: "evt-2" }));
      expect(store.count()).toBe(2);

      store.clear();
      expect(store.count()).toBe(0);
      expect(store.list()).toHaveLength(0);
    });
  });
});
