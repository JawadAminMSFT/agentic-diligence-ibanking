"use client";

import { useState, useMemo } from "react";

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

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") {
    return (
      <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg className="w-4 h-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "green"
      ? "bg-green-500"
      : status === "yellow"
        ? "bg-amber-400"
        : status === "red"
          ? "bg-red-500"
          : "bg-slate-300";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function statusBorderColor(status: string): string {
  if (status === "green") return "border-l-green-500";
  if (status === "yellow") return "border-l-amber-400";
  if (status === "red") return "border-l-red-500";
  return "border-l-slate-300";
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg className="w-3.5 h-3.5 text-slate-300 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 7l3-3 3 3M7 13l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return dir === "asc" ? (
    <svg className="w-3.5 h-3.5 text-blue-600 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-blue-600 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

// ── Color helpers ──────────────────────────────────────────────────────────────

const POSITIVE_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-teal-500", "bg-cyan-500"];
const NEGATIVE_COLORS = ["bg-red-500", "bg-amber-500", "bg-orange-500", "bg-rose-500"];
const LEGEND_POSITIVE_DOTS = ["bg-emerald-500", "bg-blue-500", "bg-teal-500", "bg-cyan-500"];
const LEGEND_NEGATIVE_DOTS = ["bg-red-500", "bg-amber-500", "bg-orange-500", "bg-rose-500"];
const CONCENTRATION_THRESHOLD = 20;

function concentrationBarColor(pct: number): string {
  if (pct > 25) return "bg-red-500";
  if (pct >= 15) return "bg-amber-400";
  return "bg-green-500";
}

function concentrationRiskLabel(pct: number): string | null {
  if (pct > 25) return "HIGH RISK";
  if (pct >= 15) return "RISK";
  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface DashboardContentProps {
  data: DashboardData;
  runId: string;
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sortField, setSortField] = useState<SortField>("index");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const revenueStats = useMemo(() => {
    const entries = Object.entries(data.revenueBreakdown).map(([category, amount]) => ({
      category,
      amount,
      isPositive: amount >= 0,
    }));
    const totalAbs = entries.reduce((s, e) => s + Math.abs(e.amount), 0);
    const netChange = entries.reduce((s, e) => s + e.amount, 0);
    return { entries, totalAbs, netChange };
  }, [data]);

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

  const positiveEntries = revenueStats.entries.filter((e) => e.isPositive);
  const negativeEntries = revenueStats.entries.filter((e) => !e.isPositive);

  function getBarColor(entry: { category: string; isPositive: boolean }): string {
    if (entry.isPositive) {
      const idx = positiveEntries.findIndex((e) => e.category === entry.category);
      return POSITIVE_COLORS[idx % POSITIVE_COLORS.length];
    }
    const idx = negativeEntries.findIndex((e) => e.category === entry.category);
    return NEGATIVE_COLORS[idx % NEGATIVE_COLORS.length];
  }

  const issueCounts = {
    all: data.issuesSummary.length,
    high: data.issuesSummary.filter((i) => i.severity === "high").length,
    medium: data.issuesSummary.filter((i) => i.severity === "medium").length,
    low: data.issuesSummary.filter((i) => i.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {data.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 border-l-4 ${statusBorderColor(kpi.status)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                {kpi.label}
              </span>
              <StatusDot status={kpi.status} />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="flex items-center gap-1">
              <TrendIcon trend={kpi.trend} />
              <span
                className={`text-xs font-medium ${
                  kpi.trend === "up"
                    ? "text-green-600"
                    : kpi.trend === "down"
                      ? "text-red-600"
                      : "text-slate-400"
                }`}
              >
                {kpi.trend === "up" ? "Trending up" : kpi.trend === "down" ? "Trending down" : "Flat"}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Two-Column: Revenue + Concentration ────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-800">Revenue Bridge</h2>
            <p className="text-xs text-slate-500">ARR Movement Analysis</p>
          </div>

          {/* Stacked horizontal bar */}
          <div className="mb-5">
            <div className="flex h-10 rounded-lg overflow-hidden">
              {revenueStats.entries.map((entry) => {
                const widthPct =
                  revenueStats.totalAbs > 0
                    ? (Math.abs(entry.amount) / revenueStats.totalAbs) * 100
                    : 0;
                return (
                  <div
                    key={entry.category}
                    className={`${getBarColor(entry)} flex items-center justify-center text-white text-xs font-medium relative group`}
                    style={{ width: `${widthPct}%`, minWidth: widthPct > 0 ? "2rem" : 0 }}
                    title={`${entry.category}: $${Math.abs(entry.amount).toFixed(1)}M`}
                  >
                    {widthPct > 8 && (
                      <span className="truncate px-1">
                        {entry.isPositive ? "" : "-"}${Math.abs(entry.amount).toFixed(1)}M
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
            {revenueStats.entries.map((entry) => {
              const dotColor = entry.isPositive
                ? LEGEND_POSITIVE_DOTS[positiveEntries.findIndex((e) => e.category === entry.category) % LEGEND_POSITIVE_DOTS.length]
                : LEGEND_NEGATIVE_DOTS[negativeEntries.findIndex((e) => e.category === entry.category) % LEGEND_NEGATIVE_DOTS.length];
              return (
                <div key={entry.category} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${dotColor}`} />
                  <span className="text-xs text-slate-600">{entry.category}</span>
                </div>
              );
            })}
          </div>

          {/* Breakdown table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revenueStats.entries.map((entry) => {
                  const pctOfTotal =
                    revenueStats.totalAbs > 0
                      ? (entry.amount / revenueStats.totalAbs) * 100
                      : 0;
                  return (
                    <tr key={entry.category} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 text-slate-700">{entry.category}</td>
                      <td className={`px-4 py-2.5 text-right font-medium ${entry.isPositive ? "text-green-700" : "text-red-600"}`}>
                        {entry.isPositive ? "" : "-"}${Math.abs(entry.amount).toFixed(1)}M
                      </td>
                      <td className={`px-4 py-2.5 text-right font-medium ${entry.isPositive ? "text-green-700" : "text-red-600"}`}>
                        {pctOfTotal >= 0 ? "+" : ""}{pctOfTotal.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-4 py-2.5 text-slate-800">Net Change</td>
                  <td className={`px-4 py-2.5 text-right ${revenueStats.netChange >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {revenueStats.netChange >= 0 ? "+" : "-"}${Math.abs(revenueStats.netChange).toFixed(1)}M
                  </td>
                  <td className="px-4 py-2.5" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Customer Concentration */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-800">Customer Concentration</h2>
            <p className="text-xs text-slate-500">Revenue Distribution Risk</p>
          </div>

          <div className="space-y-5">
            {Object.entries(data.concentrationData).map(([label, pct]) => {
              const riskLabel = concentrationRiskLabel(pct);
              const barMax = Math.max(
                ...Object.values(data.concentrationData),
                CONCENTRATION_THRESHOLD + 5
              );
              const barWidthPct = Math.min((pct / barMax) * 100, 100);
              const thresholdPos = (CONCENTRATION_THRESHOLD / barMax) * 100;

              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <div className="flex items-center gap-2">
                      {riskLabel && (
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${pct > 25 ? "text-red-600" : "text-amber-600"}`}>
                          {riskLabel}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-slate-900">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${concentrationBarColor(pct)}`}
                      style={{ width: `${barWidthPct}%` }}
                    />
                    {/* Threshold line */}
                    <div
                      className="absolute inset-y-0 w-px border-l-2 border-dashed border-slate-400"
                      style={{ left: `${thresholdPos}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Threshold legend */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
            <span className="w-4 border-t-2 border-dashed border-slate-400" />
            <span className="text-xs text-slate-500">Risk threshold ({CONCENTRATION_THRESHOLD}%)</span>
          </div>

          {/* Risk legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              <span className="text-xs text-slate-500">&lt;15% Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span className="text-xs text-slate-500">15-25% Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span className="text-xs text-slate-500">&gt;25% High</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Issues Table ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Diligence Issues</h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
              {issueCounts.all}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "high", "medium", "low"] as SeverityFilter[]).map((level) => {
              const active = severityFilter === level;
              const base = "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors";
              const styles = active
                ? level === "high"
                  ? `${base} bg-red-100 text-red-700`
                  : level === "medium"
                    ? `${base} bg-amber-100 text-amber-700`
                    : level === "low"
                      ? `${base} bg-blue-100 text-blue-700`
                      : `${base} bg-slate-800 text-white`
                : `${base} bg-slate-50 text-slate-500 hover:bg-slate-100`;
              return (
                <button key={level} className={styles} onClick={() => setSeverityFilter(level)}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                  {level !== "all" && (
                    <span className="ml-1 opacity-60">{issueCounts[level]}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th
                  className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider w-14 cursor-pointer select-none"
                  onClick={() => handleSort("index")}
                >
                  #
                  <SortIndicator active={sortField === "index"} dir={sortDir} />
                </th>
                <th
                  className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("title")}
                >
                  Title
                  <SortIndicator active={sortField === "title"} dir={sortDir} />
                </th>
                <th
                  className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider w-28 cursor-pointer select-none"
                  onClick={() => handleSort("severity")}
                >
                  Severity
                  <SortIndicator active={sortField === "severity"} dir={sortDir} />
                </th>
                <th
                  className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider w-32 cursor-pointer select-none"
                  onClick={() => handleSort("workstream")}
                >
                  Workstream
                  <SortIndicator active={sortField === "workstream"} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                    No issues match the selected filter.
                  </td>
                </tr>
              )}
              {filteredIssues.map((issue) => (
                <tr key={issue.index} className="even:bg-slate-50 hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{issue.index}</td>
                  <td className="px-4 py-2.5 text-slate-700">{issue.title}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        issue.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : issue.severity === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                      {issue.workstream.charAt(0).toUpperCase() + issue.workstream.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
