"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { sendSteering, sendQueued, type RunEvent } from "@/lib/api-client";
import TimelineEvent from "./TimelineEvent";

interface RunInfo {
  runId: string;
  status: "running" | "paused" | "completed" | "failed";
  dealName: string;
  createdAt: string;
}

interface PendingApproval {
  actionId: string;
  description: string;
  agent: string;
  toolName: string;
  args: Record<string, unknown>;
}

interface Props {
  run: RunInfo;
  events: RunEvent[];
  isConnected: boolean;
  isLoading: boolean;
  pendingApproval: PendingApproval | null;
  onApprove: (actionId: string, approved: boolean) => void;
  toolCallCount: number;
}

export default function RunTimeline({
  run,
  events,
  isConnected,
  isLoading,
  pendingApproval,
  onApprove,
  toolCallCount,
}: Props) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"steer" | "queue">("steer");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    setSendError(null);
    try {
      if (mode === "steer") {
        await sendSteering(run.runId, message.trim());
      } else {
        await sendQueued(run.runId, message.trim());
      }
      setMessage("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const statusConfig = {
    running: { label: "Running", dotClass: "bg-emerald-500 animate-pulse", badgeBg: "bg-emerald-500/15 text-emerald-600" },
    paused: { label: "Paused", dotClass: "bg-amber-500", badgeBg: "bg-amber-500/15 text-amber-600" },
    completed: { label: "Completed", dotClass: "bg-blue-500", badgeBg: "bg-blue-500/15 text-blue-600" },
    failed: { label: "Failed", dotClass: "bg-red-500", badgeBg: "bg-red-500/15 text-red-600" },
  };

  const sc = statusConfig[run.status] ?? statusConfig.running;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white border-r border-slate-200">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <span className="text-sm font-semibold text-slate-900 truncate">{run.dealName}</span>
        <span className="text-xs text-slate-400 font-mono shrink-0">{run.runId.slice(0, 8)}</span>
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0", sc.badgeBg)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", sc.dotClass)} />
          {sc.label}
        </span>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
          <span>{events.length} events</span>
          <span className="text-slate-300">|</span>
          <span>{toolCallCount} tools</span>
          <span className={cn("w-2 h-2 rounded-full shrink-0", isConnected ? "bg-green-500" : "bg-red-500")} title={isConnected ? "Connected" : "Disconnected"} />
        </div>
      </div>

      {/* Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {isLoading && events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-slate-400">Connecting to run...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-slate-400">Waiting for events...</span>
          </div>
        ) : (
          events.map((event) => (
            <TimelineEvent
              key={event.id}
              event={event}
              onApprove={onApprove}
            />
          ))
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Send a message to steer the agent..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={run.status === "completed" || run.status === "failed"}
          />
          <button
            onClick={() => setMode(mode === "steer" ? "queue" : "steer")}
            className={cn(
              "px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0",
              mode === "queue"
                ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                : "border-slate-300 text-slate-500 hover:text-slate-700",
            )}
            title={mode === "steer" ? "Switch to queue mode" : "Switch to steer mode"}
          >
            {mode === "queue" ? "Queue" : "Steer"}
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={cn(
              "p-2 rounded-lg transition-colors shrink-0",
              message.trim()
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-slate-100 text-slate-500 cursor-not-allowed",
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2L7 9" />
              <path d="M14 2L9.5 14L7 9L2 6.5L14 2z" />
            </svg>
          </button>
        </div>
        {sendError && (
          <p className="mt-2 text-xs text-red-500">{sendError}</p>
        )}
      </div>
    </div>
  );
}
