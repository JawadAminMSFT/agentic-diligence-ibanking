"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardContent, { type DashboardData } from "./DashboardContent";

const API_BASE = "http://localhost:3000";

interface DashboardModalProps {
  runId: string;
  onClose: () => void;
}

export default function DashboardModal({ runId, onClose }: DashboardModalProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/run/${runId}/dashboard-data`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [runId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-slate-50 rounded-xl shadow-2xl w-[85vw] h-[80vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-200 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white">{data?.title ?? "Dashboard"}</h2>
            <span className="text-[10px] text-rose-400 font-semibold tracking-wider">CONFIDENTIAL</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/dashboard/${runId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-cyan-300 transition-colors"
            >
              Open full page
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading dashboard...</div>
          ) : data ? (
            <DashboardContent data={data} runId={runId} />
          ) : (
            <div className="text-center py-12 text-slate-500">Dashboard data not available</div>
          )}
        </div>
      </div>
    </div>
  );
}
