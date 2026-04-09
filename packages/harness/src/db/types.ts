/**
 * To add Azure Cosmos DB support:
 * 1. Create src/db/cosmos-store.ts implementing SessionStore
 * 2. npm install @azure/cosmos
 * 3. Add "cosmos" case to createSessionStore() in index.ts
 * 4. Set SESSION_STORE_TYPE=cosmos and COSMOS_CONNECTION_STRING in .env
 */

import type { HarnessEvent } from "../events/types.js";

export interface SessionRecord {
  id: string;
  runId: string;
  dealId: string;
  codeName: string;
  status: "running" | "completed" | "failed";
  prompt: string;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
}

export interface SessionStore {
  // Session CRUD
  saveSession(session: SessionRecord): void;
  getSession(runId: string): SessionRecord | null;
  listSessions(limit?: number): SessionRecord[];
  updateSessionStatus(
    runId: string,
    status: SessionRecord["status"],
    eventCount?: number,
  ): void;

  // Event persistence
  appendEvent(runId: string, event: HarnessEvent): void;
  getEvents(runId: string): HarnessEvent[];
  getEventCount(runId: string): number;

  // Lifecycle
  close(): void;
}
