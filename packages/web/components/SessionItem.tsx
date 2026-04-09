"use client";

import { cn } from "@/lib/cn";
import type { Session } from "@/lib/api-client";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  session: Session;
  isActive: boolean;
  onClick: () => void;
}

export default function SessionItem({ session, isActive, onClick }: Props) {
  const statusColor =
    session.status === "running"
      ? "bg-emerald-500"
      : session.status === "failed"
        ? "bg-red-500"
        : session.status === "completed"
          ? "bg-emerald-400"
          : "bg-slate-500";

  const statusPulse = session.status === "running" ? "animate-pulse" : "";

  const statusLabel =
    session.status === "running"
      ? "In progress"
      : session.status === "completed"
        ? "Done"
        : session.status;

  const dealColor = session.dealName?.includes("Atlas")
    ? "bg-blue-400"
    : session.dealName?.includes("Titan")
      ? "bg-red-400"
      : session.dealName?.includes("Meridian")
        ? "bg-emerald-400"
        : "bg-slate-400";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 border-l-2 transition-colors group",
        isActive
          ? "border-l-blue-500 bg-slate-800 text-white"
          : "border-l-transparent text-slate-300 hover:bg-slate-800",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dealColor)} />
        <span className={cn("text-sm font-medium truncate flex-1", isActive ? "text-white" : "text-slate-300")}>
          {session.dealName || session.runId.slice(0, 12)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-0.5 ml-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusColor, statusPulse)} />
          <span className="text-[10px] text-slate-500">{statusLabel}</span>
          <span className="text-[10px] text-slate-600 font-mono truncate">· {session.runId.slice(0, 8)}</span>
        </div>
        <span className="text-[10px] text-slate-500 shrink-0 ml-1">
          {relativeTime(session.createdAt)}
        </span>
      </div>
    </button>
  );
}
