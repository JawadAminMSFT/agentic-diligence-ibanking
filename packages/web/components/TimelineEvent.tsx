"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { RunEvent } from "@/lib/api-client";

const SERVICE_BORDER_COLORS: Record<string, string> = {
  "web-research": "border-l-blue-500",
  "vdr": "border-l-violet-500",
  "finance": "border-l-amber-500",
  "workflow": "border-l-green-500",
  "memo": "border-l-cyan-500",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatArgs(args: Record<string, unknown>): [string, string][] {
  return Object.entries(args)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const val = typeof v === "string" ? v : JSON.stringify(v);
      return [k, val.length > 100 ? val.slice(0, 100) + "..." : val];
    });
}

interface Props {
  event: RunEvent;
  onApprove?: (actionId: string, approved: boolean) => void;
}

export default function TimelineEvent({ event, onApprove }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  // User steering message (sent by user or echoed by SDK)
  if (event.type === "steer.received" || event.type === "steer.sent") {
    return (
      <div className="flex justify-end px-4 py-1.5">
        <div className="max-w-[75%] px-3.5 py-2 rounded-xl rounded-br-sm bg-blue-600 text-white">
          <p className="text-sm">{event.summary}</p>
          <span className="text-[10px] text-blue-200 mt-1 block text-right">{formatTime(event.timestamp)}</span>
        </div>
      </div>
    );
  }

  // Agent response
  if (event.type === "agent.responded" || event.type === "agent.delegated") {
    return (
      <div className="px-4 py-1.5">
        <div className="rounded-lg bg-white border border-slate-200 shadow-sm px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-violet-600">{event.actor}</span>
            <span className="text-[10px] text-slate-400 font-mono">{formatTime(event.timestamp)}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{event.summary}</p>
        </div>
      </div>
    );
  }

  // Tool call
  if (event.type === "tool.invoked" || event.type === "tool.completed" || event.type === "tool.failed") {
    const toolName = (event.data?.toolName as string) ?? event.summary;
    const service = toolName.split("-")[0] ?? "";
    const borderColor = SERVICE_BORDER_COLORS[service] ?? "border-l-slate-400";
    const args = (event.data?.arguments ?? event.data?.input ?? {}) as Record<string, unknown>;
    const parsedArgs = typeof args === "string"
      ? (() => { try { return JSON.parse(args) as Record<string, unknown>; } catch { return {}; } })()
      : args;

    const isFailed = event.type === "tool.failed";
    const isCompleted = event.type === "tool.completed";
    const hasResult = isCompleted && event.summary;

    return (
      <div className="px-4 py-1">
        <div className={cn("border-l-2 rounded-r-md bg-slate-50 overflow-hidden", borderColor)}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-100/80 transition-colors"
          >
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
              className={cn("text-slate-400 transition-transform shrink-0", !collapsed && "rotate-90")}
            >
              <path d="M3 1l4 4-4 4z" />
            </svg>
            <span className="text-xs font-mono font-medium text-slate-700">{toolName}</span>
            {isFailed && <span className="text-[10px] font-semibold text-red-600 bg-red-500/15 px-1.5 rounded">FAILED</span>}
            {isCompleted && <span className="text-[10px] font-medium text-emerald-600">OK</span>}
            <span className="ml-auto text-[10px] text-slate-400 font-mono">{formatTime(event.timestamp)}</span>
          </button>
          {!collapsed && (
            <div className="px-3 pb-2.5 border-t border-slate-200/50">
              {Object.keys(parsedArgs).length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {formatArgs(parsedArgs).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="text-slate-400 shrink-0">{k}:</span>
                      <span className="text-slate-700 font-mono break-all">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {hasResult && (
                <div className="mt-2 pt-2 border-t border-slate-200/50">
                  <p className="text-xs text-slate-500">{event.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Issue created
  if (event.type === "issue.created") {
    const severity = (event.data?.severity as string) ?? "medium";
    return (
      <div className="px-4 py-1.5">
        <div className={cn("rounded-lg border px-3 py-2.5", severity === "high" ? "bg-red-50 border-red-200" : severity === "medium" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200")}>
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", severity === "high" ? "bg-red-500" : severity === "medium" ? "bg-amber-500" : "bg-blue-500")} />
            <span className={cn("text-sm font-semibold", severity === "high" ? "text-red-800" : severity === "medium" ? "text-amber-800" : "text-blue-800")}>{(event.data?.title as string) ?? event.summary}</span>
            <span className="text-[10px] font-mono uppercase ml-auto text-slate-500">{severity}</span>
          </div>
          {typeof event.data?.description === "string" && (
            <p className="text-xs mt-1 text-slate-600">{event.data.description}</p>
          )}
        </div>
      </div>
    );
  }

  // Memo updated
  if (event.type === "memo.updated") {
    const section = (event.data?.section as string) ?? (event.data?.sectionName as string) ?? "section";
    return (
      <div className="px-4 py-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600 shrink-0">
            <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 2v4h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs text-emerald-600">Memo updated:</span>
          <span className="text-xs text-slate-700 font-medium">{section}</span>
          <span className="ml-auto text-[10px] text-slate-400 font-mono">{formatTime(event.timestamp)}</span>
        </div>
      </div>
    );
  }

  // Approval requested
  if (event.type === "approval.requested") {
    return (
      <div className="px-4 py-1.5">
        <div className="border border-amber-200 rounded-lg bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600">
              <path d="M8 1L1 14h14L8 1z" strokeLinejoin="round" />
              <path d="M8 6v3M8 11.5v.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-semibold text-amber-700">Approval Required</span>
          </div>
          <p className="text-sm text-slate-700 mb-3">{event.summary}</p>
          {onApprove && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(event.id, true)}
                className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onApprove(event.id, false)}
                className="px-3 py-1.5 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Session events (start/end)
  if (event.type === "run.started" || event.type === "run.completed" || event.type === "run.failed" ||
      event.type === "session.started" || event.type === "session.ended") {
    const isEnd = event.type === "run.completed" || event.type === "session.ended";
    const isFail = event.type === "run.failed";
    return (
      <div className="px-4 py-1">
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            isFail ? "text-red-500" : "text-slate-400",
          )}>
            {event.summary || event.type.replace(/\./g, " ")}
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
      </div>
    );
  }

  // Evidence collected
  if (event.type === "evidence.collected") {
    return (
      <div className="px-4 py-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-50 border border-cyan-200">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-600 shrink-0">
            <path d="M14 2H6L2 6v8a1 1 0 001 1h11a1 1 0 001-1V3a1 1 0 00-1-1z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 6h4V2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs text-emerald-600">Evidence:</span>
          <span className="text-xs text-slate-700 truncate">{event.summary}</span>
          <span className="ml-auto text-[10px] text-slate-400 font-mono">{formatTime(event.timestamp)}</span>
        </div>
      </div>
    );
  }

  // Default: generic event
  return (
    <div className="px-4 py-0.5">
      <div className="flex items-center gap-2 px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
        <span className="text-xs text-slate-400">{event.actor}</span>
        <span className="text-xs text-slate-500 truncate flex-1">{event.summary || event.type}</span>
        <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatTime(event.timestamp)}</span>
      </div>
    </div>
  );
}
