import { readFileSync } from "node:fs";
import type { HarnessEvent } from "../events/types.js";

/**
 * Parse a JSONL file into an array of HarnessEvent objects.
 */
export function loadEventsFromJsonl(filePath: string): HarnessEvent[] {
  const content = readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as HarnessEvent);
}

export interface ReplayProgress {
  current: number;
  total: number;
  percentComplete: number;
}

type ReplayState = "idle" | "playing" | "paused" | "stopped";

export class ReplaySession {
  private readonly events: HarnessEvent[];
  private readonly speedMultiplier: number;
  private state: ReplayState = "idle";
  private currentIndex = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private callback: ((event: HarnessEvent) => void) | null = null;

  constructor(events: HarnessEvent[], speedMultiplier = 5) {
    this.events = events;
    this.speedMultiplier = speedMultiplier;
  }

  start(callback: (event: HarnessEvent) => void): void {
    if (this.events.length === 0) return;

    this.callback = callback;
    this.currentIndex = 0;
    this.state = "playing";
    this.emitNext();
  }

  pause(): void {
    if (this.state !== "playing") return;
    this.state = "paused";
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resume(): void {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.emitNext();
  }

  stop(): void {
    this.state = "stopped";
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.callback = null;
  }

  getProgress(): ReplayProgress {
    const total = this.events.length;
    const current = this.currentIndex;
    return {
      current,
      total,
      percentComplete: total === 0 ? 100 : Math.round((current / total) * 100),
    };
  }

  private emitNext(): void {
    if (this.state !== "playing" || !this.callback) return;
    if (this.currentIndex >= this.events.length) {
      this.state = "stopped";
      return;
    }

    const event = this.events[this.currentIndex];
    this.callback(event);
    this.currentIndex++;

    if (this.currentIndex >= this.events.length) {
      this.state = "stopped";
      return;
    }

    const delay = this.computeDelay(
      this.events[this.currentIndex - 1],
      this.events[this.currentIndex],
    );
    this.timer = setTimeout(() => this.emitNext(), delay);
  }

  private computeDelay(prev: HarnessEvent, next: HarnessEvent): number {
    const prevTime = new Date(prev.timestamp).getTime();
    const nextTime = new Date(next.timestamp).getTime();
    const delta = Math.max(0, nextTime - prevTime);
    // Divide by speed multiplier, clamp to [50ms, 3000ms]
    return Math.min(3000, Math.max(50, delta / this.speedMultiplier));
  }
}
