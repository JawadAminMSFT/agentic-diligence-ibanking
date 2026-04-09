"use client";

import { useState, useRef, useEffect } from "react";
import type { RunEvent } from "@/lib/api-client";

const EVENT_COLORS: Record<string, string> = {
  "run.started": "var(--accent)",
  "run.completed": "var(--success)",
  "run.failed": "var(--danger)",
  "agent.delegated": "#8b5cf6",
  "agent.responded": "#6366f1",
  "tool.invoked": "#06b6d4",
  "tool.completed": "#14b8a6",
  "tool.failed": "var(--danger)",
  "memo.updated": "var(--success)",
  "issue.created": "var(--warning)",
  "approval.requested": "#f97316",
  "approval.granted": "var(--success)",
  "approval.denied": "var(--danger)",
  "session.started": "var(--accent)",
  "session.ended": "#6b7280",
  "steer.received": "#ec4899",
  "error.occurred": "var(--danger)",
  "evidence.collected": "#06b6d4",
  "contradiction.detected": "#f59e0b",
};

const MOCK_EVENTS: RunEvent[] = [
  { id: "1", timestamp: new Date(Date.now() - 30000).toISOString(), type: "status_change", actor: "orchestrator", summary: "Run started — initializing workstreams" },
  { id: "2", timestamp: new Date(Date.now() - 25000).toISOString(), type: "tool_call", actor: "financial-analyst", summary: "Calling SEC EDGAR search for 10-K filings" },
  { id: "3", timestamp: new Date(Date.now() - 20000).toISOString(), type: "tool_result", actor: "financial-analyst", summary: "Retrieved 3 annual reports (2021-2023)" },
  { id: "4", timestamp: new Date(Date.now() - 15000).toISOString(), type: "evidence_added", actor: "financial-analyst", summary: "Added evidence: Revenue figures from 10-K 2023" },
  { id: "5", timestamp: new Date(Date.now() - 10000).toISOString(), type: "memo_update", actor: "financial-analyst", summary: "Updated memo section: Financial Overview" },
  { id: "6", timestamp: new Date(Date.now() - 5000).toISOString(), type: "issue_created", actor: "legal-analyst", summary: "Flagged issue: Missing auditor opinion in 2022 filing" },
  { id: "7", timestamp: new Date().toISOString(), type: "tool_call", actor: "market-analyst", summary: "Querying market data for competitive landscape" },
];

const s = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    minHeight: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  title: { fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  filterBar: {
    display: "flex",
    gap: 4,
    padding: "6px 12px",
    borderBottom: "1px solid var(--border)",
    flexWrap: "wrap" as const,
    flexShrink: 0,
  },
  filterBtn: (active: boolean) => ({
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 500,
    borderRadius: 12,
    border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
    background: active ? "rgba(59,130,246,0.15)" : "transparent",
    color: active ? "var(--accent)" : "#6b7280",
    cursor: "pointer",
  }),
  list: {
    flex: 1,
    overflow: "auto",
    padding: "8px 0",
  },
  event: {
    display: "flex",
    gap: 10,
    padding: "6px 12px",
    fontSize: 13,
    lineHeight: 1.5,
    borderBottom: "1px solid rgba(31,41,55,0.5)",
    transition: "background 0.1s",
  },
  time: { color: "#4b5563", fontFamily: "var(--font-mono)", fontSize: 11, whiteSpace: "nowrap" as const, marginTop: 2, minWidth: 56 },
  badge: (color: string) => ({
    display: "inline-block",
    padding: "1px 8px",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    background: color + "22",
    color,
    whiteSpace: "nowrap" as const,
    marginTop: 1,
  }),
  actor: { color: "#9ca3af", fontSize: 12, minWidth: 100 },
  summary: { color: "var(--fg)", flex: 1 },
  dot: { fontSize: 7, color: "var(--success)", marginTop: 5 },
  disconnected: { fontSize: 7, color: "var(--danger)", marginTop: 5 },
};

interface Props {
  events?: RunEvent[];
  isConnected?: boolean;
}

export default function EventStream({ events: externalEvents, isConnected = false }: Props) {
  const displayEvents = externalEvents && externalEvents.length > 0 ? externalEvents : MOCK_EVENTS;
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  const allTypes = Array.from(new Set(displayEvents.map((e) => e.type).filter(Boolean)));

  const filtered = activeFilters.size > 0
    ? displayEvents.filter((e) => activeFilters.has(e.type))
    : displayEvents;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [filtered.length]);

  function toggleFilter(type: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.title}>Event Stream</span>
        <span style={isConnected ? s.dot : s.disconnected}>●</span>
      </div>
      <div style={s.filterBar}>
        {allTypes.map((type) => (
          <button
            key={type}
            style={s.filterBtn(activeFilters.has(type))}
            onClick={() => toggleFilter(type)}
          >
            {(type ?? "").replace(/_/g, " ").replace(/\./g, " ")}
          </button>
        ))}
      </div>
      <div style={s.list} ref={listRef}>
        {filtered.map((event) => (
          <div key={event.id} style={s.event}>
            <span style={s.time}>{formatTime(event.timestamp)}</span>
            <span style={s.badge(EVENT_COLORS[event.type] ?? "#6b7280")}>
              {(event.type ?? "unknown").replace(/_/g, " ").replace(/\./g, " ")}
            </span>
            <span style={s.actor}>{event.actor ?? "system"}</span>
            <span style={s.summary}>{event.summary ?? ""}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "#4b5563", fontSize: 13 }}>
            No events match the selected filters
          </div>
        )}
      </div>
    </div>
  );
}
