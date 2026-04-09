"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardContent, { type DashboardData, formatTimestamp } from "@/components/DashboardContent";

const API_BASE = "http://localhost:3000";

// ── Skeleton ───────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-auto">
      {/* Header skeleton */}
      <div className="h-14 bg-slate-900 flex items-center px-6">
        <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
        <div className="flex-1" />
        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Two-column panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-32 w-full bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-full bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Issues table skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-slate-200 rounded animate-pulse" />
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Dashboard Unavailable</h2>
          <p className="text-sm text-slate-500 mb-6">
            Dashboard data not available for this run. The analysis may still be in progress or the run ID is invalid.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
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
      <header className="h-14 bg-slate-900 flex items-center px-6 shrink-0">
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mr-6"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Platform
        </a>
        <h1 className="text-sm font-semibold text-white truncate">{data.title}</h1>
        <div className="flex-1" />
        <span className="hidden sm:inline-block px-2.5 py-0.5 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-widest rounded mx-4">
          Confidential
        </span>
        <div className="flex-1" />
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {formatTimestamp(data.generatedAt)}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <DashboardContent data={data} runId={runId} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <span className="text-xs text-slate-500">
          CONFIDENTIAL &mdash; Generated by Buy-side Diligence Copilot Agent Harness
        </span>
        <span className="text-xs text-slate-400">{formatTimestamp(data.generatedAt)}</span>
      </footer>
    </div>
  );
}
