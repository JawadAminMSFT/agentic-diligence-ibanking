import { SqliteSessionStore } from "./sqlite-store.js";
import type { SessionStore } from "./types.js";

export type { SessionStore, SessionRecord } from "./types.js";

export function createSessionStore(config?: {
  type?: string;
  path?: string;
}): SessionStore {
  const storeType = config?.type ?? process.env.SESSION_STORE_TYPE ?? "sqlite";

  if (storeType === "sqlite") {
    const dbPath =
      config?.path ?? process.env.SESSION_DB_PATH ?? "./diligence-sessions.db";
    return new SqliteSessionStore(dbPath);
  }

  // Future: add "cosmos", "azure-sql", etc.
  throw new Error(`Unknown session store type: ${storeType}`);
}
