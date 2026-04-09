import Database from "better-sqlite3";
import type { HarnessEvent, HarnessEventType } from "../events/types.js";
import type { SessionRecord, SessionStore } from "./types.js";

export class SqliteSessionStore implements SessionStore {
  private db: InstanceType<typeof Database>;

  constructor(dbPath: string = "./diligence-sessions.db") {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        run_id TEXT UNIQUE NOT NULL,
        deal_id TEXT NOT NULL,
        code_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'running',
        prompt TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        event_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        actor_name TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        payload TEXT NOT NULL DEFAULT '{}',
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_events_run_id ON events(run_id);
      CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
    `);
  }

  // ── Session CRUD ──────────────────────────────────────────────

  private readonly stmtSaveSession = this.lazyStmt(`
    INSERT OR REPLACE INTO sessions
      (id, run_id, deal_id, code_name, status, prompt, created_at, updated_at, event_count)
    VALUES
      (@id, @runId, @dealId, @codeName, @status, @prompt, @createdAt, @updatedAt, @eventCount)
  `);

  saveSession(session: SessionRecord): void {
    this.stmtSaveSession().run({
      id: session.id,
      runId: session.runId,
      dealId: session.dealId,
      codeName: session.codeName,
      status: session.status,
      prompt: session.prompt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      eventCount: session.eventCount,
    });
  }

  private readonly stmtGetSession = this.lazyStmt(
    `SELECT * FROM sessions WHERE run_id = ?`,
  );

  getSession(runId: string): SessionRecord | null {
    const row = this.stmtGetSession().get(runId) as SessionRow | undefined;
    return row ? this.toSessionRecord(row) : null;
  }

  private readonly stmtListSessions = this.lazyStmt(
    `SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?`,
  );

  listSessions(limit: number = 50): SessionRecord[] {
    const rows = this.stmtListSessions().all(limit) as SessionRow[];
    return rows.map((row) => this.toSessionRecord(row));
  }

  private readonly stmtUpdateStatus = this.lazyStmt(`
    UPDATE sessions
    SET status = @status, updated_at = @updatedAt, event_count = COALESCE(@eventCount, event_count)
    WHERE run_id = @runId
  `);

  updateSessionStatus(
    runId: string,
    status: SessionRecord["status"],
    eventCount?: number,
  ): void {
    this.stmtUpdateStatus().run({
      runId,
      status,
      updatedAt: new Date().toISOString(),
      eventCount: eventCount ?? null,
    });
  }

  // ── Event persistence ─────────────────────────────────────────

  private readonly stmtAppendEvent = this.lazyStmt(`
    INSERT INTO events (run_id, event_id, event_type, actor_name, summary, payload, timestamp)
    VALUES (@runId, @eventId, @eventType, @actorName, @summary, @payload, @timestamp)
  `);

  appendEvent(runId: string, event: HarnessEvent): void {
    let payloadJson: string;
    try {
      payloadJson = JSON.stringify(event.payload);
    } catch {
      payloadJson = "{}";
    }

    this.stmtAppendEvent().run({
      runId,
      eventId: event.eventId,
      eventType: event.eventType,
      actorName: event.actorName,
      summary: event.summary,
      payload: payloadJson,
      timestamp: event.timestamp,
    });
  }

  private readonly stmtGetEvents = this.lazyStmt(
    `SELECT * FROM events WHERE run_id = ? ORDER BY id ASC`,
  );

  getEvents(runId: string): HarnessEvent[] {
    const rows = this.stmtGetEvents().all(runId) as EventRow[];
    return rows.map((row) => this.toHarnessEvent(row));
  }

  private readonly stmtGetEventCount = this.lazyStmt(
    `SELECT COUNT(*) AS cnt FROM events WHERE run_id = ?`,
  );

  getEventCount(runId: string): number {
    const row = this.stmtGetEventCount().get(runId) as
      | { cnt: number }
      | undefined;
    return row?.cnt ?? 0;
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  close(): void {
    this.db.close();
  }

  // ── Private helpers ───────────────────────────────────────────

  /**
   * Lazy-initializes a prepared statement. We store a factory closure so the
   * statement is compiled on first use rather than at property-init time
   * (which would race with table creation in the constructor).
   */
  private lazyStmt(sql: string): () => Database.Statement {
    let cached: Database.Statement | null = null;
    return () => {
      if (!cached) {
        cached = this.db.prepare(sql);
      }
      return cached;
    };
  }

  private toSessionRecord(row: SessionRow): SessionRecord {
    return {
      id: row.id,
      runId: row.run_id,
      dealId: row.deal_id,
      codeName: row.code_name,
      status: row.status as SessionRecord["status"],
      prompt: row.prompt,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      eventCount: row.event_count,
    };
  }

  private toHarnessEvent(row: EventRow): HarnessEvent {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(row.payload) as Record<string, unknown>;
    } catch {
      payload = {};
    }

    return {
      eventId: row.event_id,
      eventType: row.event_type as HarnessEventType,
      timestamp: row.timestamp,
      runId: row.run_id,
      actorName: row.actor_name,
      summary: row.summary,
      payload,
    };
  }
}

// ── Internal row shapes from SQLite ──────────────────────────────

interface SessionRow {
  id: string;
  run_id: string;
  deal_id: string;
  code_name: string;
  status: string;
  prompt: string;
  created_at: string;
  updated_at: string;
  event_count: number;
}

interface EventRow {
  id: number;
  run_id: string;
  event_id: string;
  event_type: string;
  actor_name: string;
  summary: string;
  payload: string;
  timestamp: string;
  created_at: string;
}
