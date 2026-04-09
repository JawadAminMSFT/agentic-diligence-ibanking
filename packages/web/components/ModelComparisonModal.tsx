"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

interface ModelComparison {
  metric: string;
  managementClaim: string;
  verifiedValue: string;
  delta: string;
  status: string;
}

interface Props {
  runId: string;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmed" },
  discrepancy: { bg: "bg-red-50", text: "text-red-700", label: "Discrepancy" },
  partial: { bg: "bg-amber-50", text: "text-amber-700", label: "Partial" },
  unverified: { bg: "bg-slate-100", text: "text-slate-500", label: "Unverified" },
};

export default function ModelComparisonModal({ runId, onClose }: Props) {
  const [data, setData] = useState<ModelComparison[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/run/${runId}/dashboard-data`)
      .then((r) => r.json())
      .then((d) => setData(d.modelComparison ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runId, onClose]);

  const counts = data?.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>,
  ) ?? {};

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[85vw] max-w-5xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Assumptions Verification</h2>
            <p className="text-xs text-slate-500 mt-0.5">Management claims vs. agent-verified findings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="w-6 h-6 text-slate-300 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 019.5 7" strokeLinecap="round" />
              </svg>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm text-slate-400">No comparison data available for this run</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">{counts.confirmed ?? 0} confirmed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-slate-600">{counts.discrepancy ?? 0} discrepancies</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-600">{counts.partial ?? 0} partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-xs text-slate-600">{counts.unverified ?? 0} unverified</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider font-medium">Metric</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider font-medium">Management Claim</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider font-medium">Verified Value</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider font-medium">Delta</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => {
                      const s = STATUS_STYLES[row.status] ?? STATUS_STYLES.unverified;
                      return (
                        <tr key={idx} className={cn("border-b border-slate-100", idx % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                          <td className="py-3 px-4 font-medium text-slate-800">{row.metric}</td>
                          <td className="py-3 px-4 text-slate-600">{row.managementClaim}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{row.verifiedValue}</td>
                          <td className={cn("py-3 px-4 font-medium", row.status === "discrepancy" ? "text-red-600" : "text-slate-600")}>{row.delta}</td>
                          <td className="py-3 px-4">
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", s.bg, s.text)}>{s.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
