"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { Session } from "@/lib/api-client";
import SessionItem from "./SessionItem";

function statusColorForSession(session: Session): string {
  return session.status === "running"
    ? "bg-emerald-500"
    : session.status === "failed"
      ? "bg-red-500"
      : session.status === "completed"
        ? "bg-emerald-400"
        : "bg-slate-500";
}

interface Props {
  sessions: Session[];
  activeRunId: string | null;
  onSelectSession: (runId: string) => void;
  onStartRun: (prompt: string) => void;
  onReplay: () => void;
  error: string | null;
}

export default function Sidebar({
  sessions,
  activeRunId,
  onSelectSession,
  onStartRun,
  onReplay,
  error,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const dealCount = useMemo(
    () => new Set(sessions.map((s) => s.dealName).filter(Boolean)).size,
    [sessions],
  );
  const completedCount = useMemo(
    () => sessions.filter((s) => s.status === "completed").length,
    [sessions],
  );

  async function handleSubmit() {
    if (!prompt.trim()) return;
    setIsStarting(true);
    await onStartRun(prompt.trim());
    setPrompt("");
    setShowPrompt(false);
    setIsStarting(false);
  }

  function handleNewRunClick() {
    if (collapsed) {
      setCollapsed(false);
      setShowPrompt(true);
    } else {
      setShowPrompt(!showPrompt);
    }
  }

  return (
    <aside
      className={cn(
        "relative shrink-0 bg-slate-900 flex flex-col h-screen transition-all duration-200",
        collapsed ? "w-14" : "w-60",
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-3 right-2 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? (
            <path d="M6 4l4 4-4 4" />
          ) : (
            <path d="M10 4l-4 4 4 4" />
          )}
        </svg>
      </button>

      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue-400 shrink-0">
            <path d="M10 1L3 5v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V5l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold text-white tracking-tight leading-tight">Due Diligence</div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Copilot Agent Harness</div>
            </div>
          )}
        </div>
      </div>

      {/* New Run button */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewRunClick}
          className={cn(
            "w-full flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors",
            collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
          )}
          title={collapsed ? "New Run" : undefined}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
            <path d="M8 3v10M3 8h10" />
          </svg>
          {!collapsed && (
            <>
              New Run
              <span className="text-[10px] text-blue-300 ml-auto">N</span>
            </>
          )}
        </button>
        {showPrompt && !collapsed && (
          <div className="mt-2 space-y-2">
            <input
              className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
              placeholder="Deal prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={isStarting || !prompt.trim()}
              className={cn(
                "w-full px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                prompt.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed",
              )}
            >
              {isStarting ? "Starting..." : "Start Analysis"}
            </button>
          </div>
        )}
        {error && !collapsed && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Quick stats */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 rounded-md px-2.5 py-2">
              <span className="text-[10px] text-slate-500 uppercase block">Deals</span>
              <span className="text-sm font-semibold text-white">{dealCount}</span>
            </div>
            <div className="bg-slate-800/50 rounded-md px-2.5 py-2">
              <span className="text-[10px] text-slate-500 uppercase block">Completed</span>
              <span className="text-sm font-semibold text-emerald-400">{completedCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!collapsed && (
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Deal Sessions</span>
            <span className="text-[10px] text-slate-600 font-mono">{sessions.length}</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            !collapsed && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-slate-500">No sessions yet</p>
              </div>
            )
          ) : (
            sessions.map((session) =>
              collapsed ? (
                <button
                  key={session.runId}
                  onClick={() => onSelectSession(session.runId)}
                  className={cn(
                    "w-full flex justify-center py-2",
                    activeRunId === session.runId && "bg-slate-800",
                  )}
                  title={session.dealName || session.runId.slice(0, 12)}
                >
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      statusColorForSession(session),
                      session.status === "running" && "animate-pulse",
                    )}
                  />
                </button>
              ) : (
                <SessionItem
                  key={session.runId}
                  session={session}
                  isActive={activeRunId === session.runId}
                  onClick={() => onSelectSession(session.runId)}
                />
              ),
            )
          )}
        </div>
      </div>

      {/* Demo Replay */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-slate-700/50 flex items-center justify-between">
          <button onClick={onReplay} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
            Demo Replay
          </button>
          <span className="text-[10px] text-slate-600">v0.1.0</span>
        </div>
      )}
    </aside>
  );
}
