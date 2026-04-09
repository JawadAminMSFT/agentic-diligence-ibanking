"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardContent, { type DashboardData, formatTimestamp } from "@/components/DashboardContent";

const API_BASE = "http://localhost:3000";

// ── Skeleton ───────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-auto">
      <div className="h-14 bg-white border-b border-slate-200 shadow-sm flex items-center px-6">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="flex-1" />
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-200 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-200 rounded-xl h-64 animate-pulse" />
          <div className="lg:col-span-5 bg-slate-200 rounded-xl h-64 animate-pulse" />
        </div>
        <div className="bg-slate-200 rounded-xl p-6 space-y-3">
          <div className="h-4 w-36 bg-slate-300 rounded animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams();
  const runId = params.runId as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/run/${runId}/dashboard-data`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId]);

  // ── Loading ──
  if (loading) return <LoadingSkeleton />;

  // ── Error ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center overflow-auto">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-10 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Dashboard Unavailable</h2>
          <p className="text-sm text-slate-500 mb-6">
            Dashboard data not available for this run. The analysis may still be in progress or the run ID is invalid.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Platform
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Platform
            </a>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{data.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated {formatTimestamp(data.generatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-red-500 font-semibold tracking-wider">CONFIDENTIAL</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <DashboardContent data={data} runId={runId} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-3 mt-8 shrink-0">
        <p className="text-[10px] text-slate-400 text-center">
          CONFIDENTIAL &mdash; Generated by Buy-side Diligence Copilot Agent Harness
        </p>
      </footer>
    </div>
  );
}
