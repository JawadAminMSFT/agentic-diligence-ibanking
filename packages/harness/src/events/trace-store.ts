import type { HarnessEvent, HarnessEventType } from "./types.js";

export interface TraceFilter {
  runId?: string;
  eventType?: HarnessEventType;
  actorName?: string;
  since?: string;
  until?: string;
}

export class TraceStore {
  private events: HarnessEvent[] = [];

  append(event: HarnessEvent): void {
    this.events.push(event);
  }

  list(filter?: TraceFilter): HarnessEvent[] {
    if (!filter) {
      return [...this.events];
    }

    return this.events.filter((e) => {
      if (filter.runId && e.runId !== filter.runId) return false;
      if (filter.eventType && e.eventType !== filter.eventType) return false;
      if (filter.actorName && e.actorName !== filter.actorName) return false;
      if (filter.since && e.timestamp < filter.since) return false;
      if (filter.until && e.timestamp > filter.until) return false;
      return true;
    });
  }

  count(filter?: TraceFilter): number {
    return this.list(filter).length;
  }

  toJSONL(filter?: TraceFilter): string {
    return this.list(filter)
      .map((e) => JSON.stringify(e))
      .join("\n");
  }

  clear(): void {
    this.events = [];
  }
}
