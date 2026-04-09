"use client";

import { useMemo, useState } from "react";
import type { RunEvent, TraceTurn } from "@/lib/api-client";

const s = {
  container: { padding: 16 },
  title: { fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 12 },
  card: (expanded: boolean) => ({
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    marginBottom: 8,
    background: expanded ? "var(--surface)" : "transparent",
    transition: "background 0.15s",
  }),
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    cursor: "pointer",
    userSelect: "none" as const,
  },
  turnNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(59,130,246,0.15)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  agentName: { fontWeight: 600, fontSize: 13, color: "var(--fg)", flex: 1 },
  toolCount: { fontSize: 11, color: "#6b7280" },
  chevron: (expanded: boolean) => ({
    transition: "transform 0.15s",
    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
    color: "#6b7280",
    fontSize: 12,
  }),
  body: { padding: "0 14px 14px", borderTop: "1px solid var(--border)" },
  thinking: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic" as const,
    padding: "8px 12px",
    background: "rgba(59,130,246,0.05)",
    borderRadius: "var(--radius)",
    marginBottom: 8,
    marginTop: 8,
  },
  toolCall: {
    padding: "8px 12px",
    marginTop: 6,
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
  },
  toolName: { fontFamily: "var(--font-mono)", color: "#8b5cf6", fontWeight: 600, fontSize: 12 },
  toolArgs: { fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b7280", marginTop: 4, margin: 0, marginBottom: 0, whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const },
  toolResult: { fontSize: 12, color: "var(--fg)", marginTop: 4, paddingTop: 4, borderTop: "1px solid var(--border)" },
};

/** Parse nested result.content JSON string from tool completion data. */
function parseResultContent(data: Record<string, unknown> | undefined): unknown {
  try {
    const result = data?.result as Record<string, unknown> | undefined;
    const content = (result?.content as string) ?? (data?.content as string) ?? "";
    if (content.startsWith("{") || content.startsWith("[")) return JSON.parse(content);
    if (content) return content;
  } catch { /* ignore */ }
  return null;
}

/** Format args as a clean "key = value" list instead of raw JSON. */
function formatArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return "(no arguments)";
  return entries
    .map(([k, v]) => {
      const val = typeof v === "string" ? v : JSON.stringify(v);
      const display = val.length > 120 ? val.slice(0, 120) + "…" : val;
      return `${k} = ${display}`;
    })
    .join("\n");
}

/** Produce a human-readable summary of a tool result. */
function formatResult(data: Record<string, unknown> | undefined, summary: string): string {
  const parsed = parseResultContent(data);
  if (parsed === null) return summary;

  if (typeof parsed === "string") {
    return parsed.length > 300 ? parsed.slice(0, 300) + "…" : parsed;
  }
  if (Array.isArray(parsed)) {
    return `Returned ${parsed.length} item(s)`;
  }
  const obj = parsed as Record<string, unknown>;

  // For issue creation results
  if (obj.title && obj.issueId) {
    return `Issue ${obj.issueId}: ${obj.title}`;
  }
  // For memo section results
  if (obj.section && typeof obj.section === "object") {
    const sec = obj.section as Record<string, unknown>;
    const name = (sec.name as string) ?? "";
    const md = (sec.markdown as string) ?? "";
    const preview = md.length > 200 ? md.slice(0, 200) + "…" : md;
    return name ? `Section "${name}": ${preview}` : preview;
  }
  // For search results
  if (obj.results && Array.isArray(obj.results)) {
    return `Returned ${(obj.results as unknown[]).length} result(s)`;
  }
  // Generic: show message if present, otherwise truncated JSON
  if (obj.message) return obj.message as string;
  const json = JSON.stringify(obj);
  return json.length > 200 ? json.slice(0, 200) + "…" : json;
}

function buildTurnsFromEvents(events: RunEvent[]): TraceTurn[] {
  const turns: TraceTurn[] = [];
  const pendingCalls = new Map<string, { name: string; args: Record<string, unknown>; actor: string }>();
  const turnMap = new Map<string, TraceTurn>();

  for (const ev of events) {
    if (ev.type === "tool.invoked") {
      const toolName = (ev.data?.toolName as string) ?? ev.summary;
      const rawArgs = ev.data?.arguments ?? ev.data?.input ?? {};
      const args = typeof rawArgs === "string"
        ? (() => { try { return JSON.parse(rawArgs) as Record<string, unknown>; } catch { return {}; } })()
        : (rawArgs as Record<string, unknown>);
      pendingCalls.set(ev.id, { name: toolName, args, actor: ev.actor });

      const agentName = ev.actor.replace(/^agent:/, "");
      if (!turnMap.has(agentName)) {
        const turn: TraceTurn = {
          turnNumber: turns.length + 1,
          agentName,
          toolCalls: [],
        };
        turnMap.set(agentName, turn);
        turns.push(turn);
      }
      turnMap.get(agentName)!.toolCalls.push({ name: toolName, args });
    } else if (ev.type === "tool.completed") {
      const toolName = (ev.data?.toolName as string) ?? ev.summary;
      const result = formatResult(ev.data, ev.summary);
      const agentName = ev.actor.replace(/^agent:/, "");
      const turn = turnMap.get(agentName);
      if (turn) {
        const tc = turn.toolCalls.find((c) => c.name === toolName && !c.result);
        if (tc) tc.result = result;
      }
    }
  }

  return turns;
}

interface Props {
  turns?: TraceTurn[];
  events?: RunEvent[];
}

export default function TraceInspector({ turns, events }: Props) {
  const derivedTurns = useMemo(
    () => (events && events.length > 0 ? buildTurnsFromEvents(events) : []),
    [events],
  );
  const displayTurns = turns && turns.length > 0 ? turns : derivedTurns;
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div style={s.container}>
      <div style={s.title}>Trace Inspector</div>
      {displayTurns.length === 0 ? (
        <div style={{ textAlign: "center" as const, padding: 48, color: "#4b5563", fontSize: 13 }}>
          No trace data yet. Trace will build as the agent executes turns.
        </div>
      ) : null}
      {displayTurns.map((turn) => {
        const isExpanded = expanded.has(turn.turnNumber);
        return (
          <div key={turn.turnNumber} style={s.card(isExpanded)}>
            <div style={s.cardHeader} onClick={() => toggle(turn.turnNumber)}>
              <span style={s.chevron(isExpanded)}>▶</span>
              <span style={s.turnNum}>{turn.turnNumber}</span>
              <span style={s.agentName}>{turn.agentName}</span>
              <span style={s.toolCount}>
                {turn.toolCalls.length} tool call{turn.toolCalls.length !== 1 ? "s" : ""}
              </span>
            </div>
            {isExpanded && (
              <div style={s.body}>
                {turn.thinking && <div style={s.thinking}>💭 {turn.thinking}</div>}
                {turn.toolCalls.map((tc: TraceTurn["toolCalls"][number], i: number) => (
                  <div key={i} style={s.toolCall}>
                    <div style={s.toolName}>🔧 {tc.name}</div>
                    <pre style={s.toolArgs}>{formatArgs(tc.args)}</pre>
                    {tc.result && <div style={s.toolResult}>→ {tc.result}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
