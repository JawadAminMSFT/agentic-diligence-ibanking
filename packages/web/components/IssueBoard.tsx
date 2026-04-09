"use client";

import { useState } from "react";
import type { Issue } from "@/lib/api-client";


const SEVERITY_COLORS: Record<string, string> = {
  low: "var(--accent)",
  medium: "var(--warning)",
  high: "var(--danger)",
};

const s = {
  container: { padding: 16 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  filters: { display: "flex", gap: 6 },
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
  card: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 14,
    marginBottom: 8,
    background: "var(--surface)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  issueTitle: { fontWeight: 600, fontSize: 14, color: "var(--fg)", flex: 1 },
  badge: (color: string) => ({
    display: "inline-block",
    padding: "1px 8px",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    background: color + "22",
    color,
    textTransform: "uppercase" as const,
  }),
  workstreamTag: {
    display: "inline-block",
    padding: "1px 8px",
    fontSize: 10,
    fontWeight: 500,
    borderRadius: 10,
    background: "rgba(107,114,128,0.2)",
    color: "#9ca3af",
  },
  desc: { fontSize: 13, color: "#d1d5db", lineHeight: 1.6, marginBottom: 8 },
  nextAction: {
    fontSize: 12,
    color: "#9ca3af",
    paddingTop: 8,
    borderTop: "1px solid var(--border)",
  },
  empty: { textAlign: "center" as const, padding: 48, color: "#4b5563", fontSize: 13 },
};

interface Props {
  issues?: Issue[];
}

export default function IssueBoard({ issues = [] }: Props) {
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [workstreamFilter, setWorkstreamFilter] = useState<string | null>(null);

  if (issues.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <span style={s.title}>Open Issues (0)</span>
        </div>
        <div style={s.empty}>No issues found yet. Issues will appear as agents identify risks.</div>
      </div>
    );
  }

  const workstreams = Array.from(new Set(issues.map((i) => i.workstream)));

  const filtered = issues.filter((i) => {
    if (severityFilter && i.severity !== severityFilter) return false;
    if (workstreamFilter && i.workstream !== workstreamFilter) return false;
    return true;
  });

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.title}>Open Issues ({filtered.length})</span>
        <div style={s.filters}>
          {(["high", "medium", "low"] as const).map((sev) => (
            <button
              key={sev}
              style={s.filterBtn(severityFilter === sev)}
              onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
            >
              {sev}
            </button>
          ))}
          {workstreams.map((ws) => (
            <button
              key={ws}
              style={s.filterBtn(workstreamFilter === ws)}
              onClick={() => setWorkstreamFilter(workstreamFilter === ws ? null : ws)}
            >
              {ws}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div style={s.empty}>No issues match the selected filters</div>
      ) : (
        filtered.map((issue) => (
          <div key={issue.id} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.issueTitle}>{issue.title}</span>
              <span style={s.badge(SEVERITY_COLORS[issue.severity] ?? "#6b7280")}>
                {issue.severity}
              </span>
              <span style={s.workstreamTag}>{issue.workstream}</span>
            </div>
            <div style={s.desc}>{issue.description}</div>
            <div style={s.nextAction}>
              <strong>Next:</strong> {issue.nextAction}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
