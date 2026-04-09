"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface KPI {
  label: string;
  value: string;
  trend: string;
  status: string;
}

export interface IssueSummary {
  title: string;
  severity: string;
  workstream: string;
}

export interface DashboardData {
  title: string;
  generatedAt: string;
  kpis: KPI[];
  revenueBreakdown: Record<string, number>;
  issuesSummary: IssueSummary[];
  concentrationData: Record<string, number>;
}

type SortField = "index" | "title" | "severity" | "workstream";
type SortDir = "asc" | "desc";
type SeverityFilter = "all" | "high" | "medium" | "low";

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatMoney(val: number): string {
  const abs = Math.abs(val);
  const prefix = val >= 0 ? "+$" : "-$";
  return `${prefix}${abs.toFixed(1)}M`;
}

function statusDotColor(status: string): string {
  if (status === "green") return "bg-emerald-400";
  if (status === "yellow") return "bg-amber-400";
  if (status === "red") return "bg-rose-400";
  return "bg-slate-500";
}

const CONCENTRATION_THRESHOLD = 20;

const SEV_COLORS = {
  high: { dot: "bg-rose-400", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  medium: { dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-400", border: "border-amber-200" },
  low: { dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-400", border: "border-emerald-200" },
} as const;

function getSevColors(severity: string) {
  return SEV_COLORS[severity as keyof typeof SEV_COLORS] ?? SEV_COLORS.medium;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface DashboardContentProps {
  data: DashboardData;
  runId: string;
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sortField, setSortField] = useState<SortField>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const revenueEntries = useMemo(() => {
    return Object.entries(data.revenueBreakdown).map(([category, amount]) => ({
      category,
      amount,
      isPositive: amount >= 0,
    }));
  }, [data]);

  const maxRevenueAbs = useMemo(
    () => Math.max(...revenueEntries.map((e) => Math.abs(e.amount)), 1),
    [revenueEntries],
  );

  const netChange = useMemo(
    () => revenueEntries.reduce((s, e) => s + e.amount, 0),
    [revenueEntries],
  );

  const filteredIssues = useMemo(() => {
    let issues = data.issuesSummary.map((issue, i) => ({ ...issue, index: i + 1 }));
    if (severityFilter !== "all") {
      issues = issues.filter((issue) => issue.severity === severityFilter);
    }
    issues.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "index":
          cmp = a.index - b.index;
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "severity":
          cmp = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
          break;
        case "workstream":
          cmp = a.workstream.localeCompare(b.workstream);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return issues;
  }, [data, severityFilter, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const issueCounts = {
    all: data.issuesSummary.length,
    high: data.issuesSummary.filter((i) => i.severity === "high").length,
    medium: data.issuesSummary.filter((i) => i.severity === "medium").length,
    low: data.issuesSummary.filter((i) => i.severity === "low").length,
  };

  const concentrationEntries = Object.entries(data.concentrationData);

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-slate-200 shadow-sm rounded-xl p-5"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
              {kpi.label}
            </p>
            <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn("w-2 h-2 rounded-full", statusDotColor(kpi.status))} />
              <span
                className={cn(
                  "text-xs",
                  kpi.trend === "up" && "text-emerald-400",
                  kpi.trend === "down" && "text-red-600",
                  kpi.trend !== "up" && kpi.trend !== "down" && "text-slate-400",
                )}
              >
                {kpi.trend === "up" ? "Trending up" : kpi.trend === "down" ? "Trending down" : "Flat"}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Two-Column: Revenue + Concentration ────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bridge */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Revenue Bridge</h3>
          <p className="text-xs text-slate-500 mb-5">ARR Movement Analysis</p>

          <div className="space-y-3">
            {revenueEntries.map((entry) => {
              const pct = (Math.abs(entry.amount) / maxRevenueAbs) * 100;
              const barColor = entry.isPositive ? "bg-blue-500" : "bg-red-500";
              return (
                <div key={entry.category} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 shrink-0 text-right truncate">
                    {entry.category}
                  </span>
                  <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden">
                    <div
                      className={cn("h-full rounded", barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-mono w-20 text-right",
                      entry.isPositive ? "text-blue-600" : "text-red-600",
                    )}
                  >
                    {formatMoney(entry.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Net change footer */}
          <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Net Change</span>
            <span
              className={cn(
                "text-sm font-bold font-mono",
                netChange >= 0 ? "text-blue-600" : "text-red-600",
              )}
            >
              {formatMoney(netChange)}
            </span>
          </div>
        </div>

        {/* Customer Concentration */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Customer Concentration</h3>
          <p className="text-xs text-slate-500 mb-5">Revenue Distribution Risk</p>

          <div className="space-y-4">
            {concentrationEntries.map(([label, pct]) => {
              const barColor =
                pct > 25 ? "bg-red-500" : pct > 15 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span
                      className={cn(
                        pct > 20 ? "text-red-600 font-semibold" : "text-slate-300",
                      )}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Threshold marker */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-px flex-1 border-t border-dashed border-red-300" />
            <span className="text-[10px] text-red-600">{CONCENTRATION_THRESHOLD}% risk threshold</span>
            <div className="h-px flex-1 border-t border-dashed border-red-300" />
          </div>

          {/* Risk legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-xs text-slate-500">&lt;15% Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-xs text-slate-500">15-25% Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span className="text-xs text-slate-500">&gt;25% High</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Diligence Issues ────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Diligence Issues</h3>
            <p className="text-xs text-slate-500">{issueCounts.all} issues identified</p>
          </div>
          <div className="flex gap-1">
            {(["all", "high", "medium", "low"] as SeverityFilter[]).map((level) => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  severityFilter === level
                    ? "bg-slate-800 text-slate-900"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
                {level !== "all" && (
                  <span className="ml-1 opacity-60">{issueCounts[level]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sortable header row */}
        <div className="flex items-center gap-4 px-4 pb-2 border-b border-slate-700/40 mb-2">
          <button
            onClick={() => handleSort("severity")}
            className="text-[10px] text-slate-500 uppercase tracking-wider font-medium hover:text-slate-300 transition-colors w-20 text-left"
          >
            Severity
          </button>
          <button
            onClick={() => handleSort("title")}
            className="text-[10px] text-slate-500 uppercase tracking-wider font-medium hover:text-slate-300 transition-colors flex-1 text-left"
          >
            Title
          </button>
          <button
            onClick={() => handleSort("workstream")}
            className="text-[10px] text-slate-500 uppercase tracking-wider font-medium hover:text-slate-300 transition-colors w-28 text-right"
          >
            Workstream
          </button>
        </div>

        <div className="space-y-2">
          {filteredIssues.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No issues match the selected filter.
            </div>
          )}
          {filteredIssues.map((issue) => {
            const sc = getSevColors(issue.severity);
            return (
              <div
                key={issue.index}
                className={cn(
                  "bg-slate-50 border rounded-lg p-4 hover:bg-slate-100 transition-colors",
                  sc.border,
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", sc.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          sc.bg,
                          sc.text,
                        )}
                      >
                        {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-400">
                        {issue.workstream.charAt(0).toUpperCase() + issue.workstream.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800">{issue.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
