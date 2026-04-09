"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { RunEvent, MemoSection, Issue, Evidence } from "@/lib/api-client";
import ExportReportButton from "./ExportReport";
import { ArtifactCards } from "./ArtifactViewer";

/* ---------- Sub-data used by SkillsView & ToolRegistryView inline ---------- */

interface Skill {
  name: string;
  displayName: string;
  description: string;
  category: "methodology" | "specialist" | "output";
  details: string;
}

const SKILLS: Skill[] = [
  {
    name: "diligence-methodology",
    displayName: "Diligence Methodology",
    description: "M&A diligence best practices",
    category: "methodology",
    details: `Core workflow: Public-first research → private data review → cross-referencing → issue creation → memo drafting.

Step 1 — Public Context: Build an independent thesis from public filings, news, reviews, and market data before touching private materials.
Step 2 — Private Review: Analyze VDR documents, financials, and KPI workbooks. Compare against the independent view.
Step 3 — Cross-Reference: Systematically compare management claims (CIM) against independently sourced data points.
Step 4 — Quantify Risks: Assign evidence-backed confidence scores. Flag material discrepancies with dollar-impact estimates.
Step 5 — Issue Tracking: Surface issues via workflow-create_issue, ranked by severity (high/medium/low).
Step 6 — Memo Drafting: Draft IC memo sections incrementally as evidence accumulates, never wait until the end.

Guiding principle: Every claim in the memo must trace back to a cited source with provenance label.`,
  },
  {
    name: "evidence-rules",
    displayName: "Evidence Rules",
    description: "Provenance labeling & confidence scoring",
    category: "methodology",
    details: `Provenance labels (every data point must carry one):
• public_live — sourced from public web (news articles, SEC filings, G2/Glassdoor reviews, press releases).
• synthetic_private — sourced from VDR documents, financial models, or internal systems.
• derived — conclusions drawn by combining or computing across multiple sources.

Confidence scoring framework:
• 0.9–1.0 (High): Verified from 2+ independent sources with no contradictions.
• 0.7–0.89 (Medium): Single reliable source, or multiple sources with minor discrepancies.
• Below 0.7 (Low): Inferred, partial data, or single unverified source.

Evidence linking: Each memo assertion must reference ≥1 evidence record by ID.
Contradiction handling: When sources disagree, create both evidence records and flag a contradiction issue.
Staleness: Public data older than 90 days should be re-verified or downgraded in confidence.`,
  },
  {
    name: "contradiction-detection",
    displayName: "Contradiction Detection",
    description: "Cross-source conflict detection",
    category: "methodology",
    details: `A contradiction exists when:
• A public claim directly conflicts with private data (e.g., press release vs. VDR financials).
• Segment-level data contradicts blended metrics (e.g., enterprise NRR masks SMB churn).
• Financial statements don't reconcile with KPI workbooks (e.g., ARR vs. recognized revenue).
• Management narrative in the CIM doesn't match documented evidence in the data room.
• Time-series data shows a trend break that contradicts a "consistent growth" claim.

Severity classification:
• High: >5% revenue impact or fundamental thesis risk. Requires immediate issue creation.
• Medium: 1–5% impact or notable but not deal-breaking. Flag for seller Q&A.
• Low: <1% impact or cosmetic inconsistency. Note in memo, no escalation needed.

Action: Create an issue via workflow-create_issue with severity, both conflicting data points cited, and a recommended next step (e.g., seller clarification question).`,
  },
  {
    name: "commercial-analysis",
    displayName: "Commercial Analysis",
    description: "Commercial due diligence",
    category: "specialist",
    details: `Market position: Validate TAM/SAM claims against independent sources (Gartner, IDC, public filings). Compute implied market share and compare to peer set.

Customer analysis: Segment breakdown (enterprise/mid-market/SMB) by ARR contribution, logo count, and growth rate per segment.
Concentration risk: Calculate Top 1/5/10 customers as % of total ARR. Flag if Top 5 > 25%.
Cohort behavior: Compare customer acquisition cohorts for retention divergence across segments.

Competitive moat: Identify differentiation claims and cross-reference with public product reviews, G2/Capterra data, and competitor positioning.

Go-to-market efficiency: Compute CAC payback, sales efficiency ratio, and magic number. Compare against SaaS benchmarks.

Public-private delta: Document every instance where the CIM narrative diverges from independently verifiable data. Quantify the gap.`,
  },
  {
    name: "financial-analysis",
    displayName: "Financial Analysis",
    description: "Financial due diligence",
    category: "specialist",
    details: `Revenue quality: Distinguish ARR vs. recognized revenue vs. bookings. Reconcile each and flag discrepancies.

Growth decomposition via revenue bridge: New business + expansion − contraction − churn = net change. Reconcile against CIM claims and identify any unexplained gaps.

Retention deep-dive: Calculate blended AND segment-level NRR and GRR. Blended numbers mask problems — always decompose by customer segment and cohort vintage.

Unit economics: LTV/CAC ratio (target >3x), CAC payback period (target <18mo), S&M as % of revenue trend. Compare to public SaaS benchmarks.

Cash flow and runway: Free cash flow margins, burn rate trend, months of runway. Flag if <12 months runway or deteriorating FCF margin.

Red flags checklist: Revenue recognition policy changes, large contract true-ups, one-time items in recurring metrics, channel/reseller revenue opacity, deferred revenue trends diverging from billings.`,
  },
  {
    name: "legal-analysis",
    displayName: "Legal Analysis",
    description: "Legal due diligence",
    category: "specialist",
    details: `Contract transferability: Check for change-of-control (CoC) provisions. Quantify ARR at risk from CoC termination rights across the top 20 contracts.

Assignment restrictions: Verify contracts are assignable without counterparty consent, or catalog consent requirements and timeline risk.

Liability caps: Review indemnification provisions, limitation of liability clauses, and uncapped liability exposure areas.

IP ownership: Confirm clean IP ownership chain — employee invention assignments, contractor work-for-hire agreements, no open-source license contamination (GPL in proprietary code).

Employment and key-person risk: Identify key employees with non-compete/non-solicit gaps, unvested equity cliffs, or roles critical to product continuity.

Regulatory compliance: Verify SOC 2, GDPR, HIPAA (if applicable) compliance status. Flag any pending audits, known violations, or gaps in certification coverage.

Missing documents: Cross-check VDR index against expected document list. Flag any material gaps (e.g., missing customer contracts, missing IP assignments).`,
  },
  {
    name: "memo-format",
    displayName: "Memo Format",
    description: "IC memo structure guidelines",
    category: "output",
    details: `Sections: Executive Summary, Commercial, Financial, Legal, Open Issues, Recommendation.

Executive Summary: Opportunity overview with key metric, investment thesis (2–3 bullets), key risks (2–3 bullets with quantification), preliminary assessment with confidence qualifier.

Commercial: Market position with TAM/SAM, customer analysis with segment breakdown, concentration risk (Top 1/5/10 as % of ARR), competitive moat, go-to-market efficiency, public-private delta.

Financial: Revenue quality (ARR vs recognized), growth decomposition via revenue bridge, retention deep-dive (blended AND segment-level NRR/GRR), unit economics (LTV/CAC, payback), cash flow and runway, red flags.

Legal: Contract transferability with CoC quantification, assignment restrictions, liability caps, IP ownership, employment and key-person risk, regulatory compliance status.

Writing standard: Use specific numbers, state direct findings with evidence citations, call out contradictions explicitly, attach confidence qualifiers (High/Medium/Low) to every material assertion.`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  methodology: "text-blue-400 bg-blue-500/15",
  specialist: "text-violet-400 bg-violet-500/15",
  output: "text-green-400 bg-green-500/15",
};

interface ToolItem {
  name: string;
  service: string;
  tier: 0 | 1 | 2;
  description: string;
}

const TOOLS: ToolItem[] = [
  { name: "web-research-search", service: "web-research", tier: 0, description: "Search public web sources" },
  { name: "web-research-open_page", service: "web-research", tier: 0, description: "Open a cached web page" },
  { name: "vdr-search_documents", service: "vdr", tier: 0, description: "Search virtual data room" },
  { name: "vdr-open_document", service: "vdr", tier: 0, description: "Read a VDR document" },
  { name: "finance-load_kpis", service: "finance", tier: 0, description: "Load financial KPIs" },
  { name: "finance-compute_cohorts", service: "finance", tier: 0, description: "Compute retention cohorts" },
  { name: "finance-revenue_bridge", service: "finance", tier: 0, description: "Revenue bridge analysis" },
  { name: "workflow-create_issue", service: "workflow", tier: 1, description: "Create a diligence issue" },
  { name: "workflow-draft_seller_question", service: "workflow", tier: 2, description: "Draft seller question (approval)" },
  { name: "workflow-list_issues", service: "workflow", tier: 0, description: "List all issues" },
  { name: "memo-read_section", service: "memo", tier: 0, description: "Read memo section" },
  { name: "memo-write_section", service: "memo", tier: 1, description: "Write memo section" },
  { name: "memo-read_full_memo", service: "memo", tier: 0, description: "Read complete memo" },
];

const TIER_BADGES: Record<number, { label: string; cls: string }> = {
  0: { label: "Auto", cls: "text-green-400 bg-green-500/15" },
  1: { label: "Notify", cls: "text-amber-400 bg-amber-500/15" },
  2: { label: "Approve", cls: "text-red-400 bg-red-500/15" },
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

/* ---------- Main component ---------- */

const TABS = ["Memo", "Issues", "Evidence", "Trace", "Skills", "Tools", "Artifacts"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  runId?: string;
  events: RunEvent[];
  memo: MemoSection[];
  issues: Issue[];
  evidence: Evidence[];
  onClose: () => void;
  toolCallCount: number;
  dealName?: string;
  onOpenDashboard?: (runId: string) => void;
}

export default function IntelPanel({
  runId,
  events,
  memo,
  issues,
  evidence,
  onClose,
  toolCallCount,
  dealName = "Due Diligence Report",
  onOpenDashboard,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Memo");

  const messageCount = events.filter((e) => e.type === "steer.received" || e.type === "agent.responded").length;

  return (
    <aside className="flex-1 bg-slate-50 border-l border-slate-200 flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-800">Intelligence</h2>
        <div className="flex items-center gap-2">
          <ExportReportButton dealName={dealName} memo={memo} issues={issues} />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
            title="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="shrink-0 grid grid-cols-4 gap-3 px-3 py-3 border-b border-slate-200">
        {[
          { label: "Messages", value: messageCount },
          { label: "Events", value: events.length },
          { label: "Issues", value: issues.length },
          { label: "Tools", value: toolCallCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-slate-200 shadow-sm px-3 py-2.5 text-center">
            <div className="text-lg font-bold text-slate-900 tabular-nums">{stat.value}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors border-b-2",
              activeTab === tab
                ? "text-blue-600 border-b-blue-600"
                : "text-slate-400 border-b-transparent hover:text-slate-700",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Memo" && <MemoTab sections={memo} />}
        {activeTab === "Issues" && <IssuesTab issues={issues} />}
        {activeTab === "Evidence" && <EvidenceTab evidence={evidence} />}
        {activeTab === "Trace" && <TraceTab events={events} />}
        {activeTab === "Skills" && <SkillsTab />}
        {activeTab === "Tools" && <ToolsTab />}
        {activeTab === "Artifacts" && runId && <ArtifactCards runId={runId} onOpenDashboard={onOpenDashboard} />}
        {activeTab === "Artifacts" && !runId && (
          <div className="flex items-center justify-center py-12">
            <p className="text-xs text-slate-400">No run ID available</p>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ---------- Tab panels ---------- */

const MEMO_MD_COMPONENTS = {
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-base font-semibold text-slate-800 mt-3 mb-1" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }: React.ComponentPropsWithoutRef<"h4">) => (
    <h4 className="text-sm font-semibold text-slate-700 mt-2 mb-1" {...props}>{children}</h4>
  ),
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-sm text-slate-600 mb-2 leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="text-sm text-slate-600 list-disc ml-4 mb-2" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="text-sm text-slate-600 list-decimal ml-4 mb-2" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className="mb-1" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-slate-800" {...props}>{children}</strong>
  ),
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <table className="text-xs border-collapse w-full mb-3" {...props}>{children}</table>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left font-medium" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td className="border border-slate-300 px-2 py-1" {...props}>{children}</td>
  ),
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-2 border-slate-300 pl-3 italic text-slate-500" {...props}>{children}</blockquote>
  ),
} as Record<string, React.ComponentType>;

function MemoTab({ sections }: { sections: MemoSection[] }) {
  const [expandedMemo, setExpandedMemo] = useState<string | null>(null);

  if (sections.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-400">No memo sections yet. Memo will populate as the agent writes findings.</p>
      </div>
    );
  }

  const toggleMemo = (title: string) => {
    setExpandedMemo((prev) => (prev === title ? null : title));
  };

  return (
    <div className="p-3 space-y-2">
      {sections.map((section, i) => {
        const key = `${section.title}-${i}`;
        const expanded = expandedMemo === key;
        const confPct = Math.round(section.confidence * 100);
        const confColor = section.confidence >= 0.85 ? "text-emerald-700 bg-emerald-100" : section.confidence >= 0.7 ? "text-amber-700 bg-amber-100" : "text-red-700 bg-red-100";
        const preview = section.content.length > 200
          ? section.content.slice(0, 200) + "..."
          : section.content;
        return (
          <div key={i} className="rounded-lg border border-slate-200 bg-white shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", confColor)}>{confPct}%</span>
            </div>

            {expanded ? (
              <div className="prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MEMO_MD_COMPONENTS}>
                  {section.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">{preview}</p>
            )}

            <button
              type="button"
              onClick={() => toggleMemo(key)}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>

            {section.evidenceIds.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-400">Evidence:</span>
                {section.evidenceIds.map((eid) => (
                  <span key={eid} className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{eid}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function IssuesTab({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-400">No issues found yet. Issues will appear as agents identify risks.</p>
      </div>
    );
  }
  return (
    <div className="p-3 space-y-2">
      {issues.map((issue) => {
        const sevColor = SEVERITY_COLORS[issue.severity] ?? "bg-slate-400";
        return (
          <div key={issue.id} className="rounded-lg border border-slate-200 bg-white shadow-sm p-3">
            <div className="flex items-start gap-2">
              <span className={cn("w-1 h-full min-h-[32px] rounded-full shrink-0 mt-0.5", sevColor)} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900 truncate">{issue.title}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={cn(
                    "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full",
                    issue.severity === "high" ? "text-red-700 bg-red-100" :
                    issue.severity === "medium" ? "text-amber-700 bg-amber-100" :
                    "text-blue-700 bg-blue-100",
                  )}>{issue.severity}</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{issue.workstream}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{issue.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillsTab() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const toggleSkill = (name: string) => {
    setExpandedSkill((prev) => (prev === name ? null : name));
  };

  return (
    <div className="p-3 space-y-1.5">
      {SKILLS.map((skill) => {
        const catCls = CATEGORY_COLORS[skill.category] ?? "text-slate-500 bg-slate-400/15";
        const expanded = expandedSkill === skill.name;
        return (
          <div key={skill.name} className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div
              className="cursor-pointer px-3 py-2"
              onClick={() => toggleSkill(skill.name)}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0", expanded && "rotate-90")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800">{skill.displayName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{skill.description}</div>
                </div>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 capitalize", catCls)}>{skill.category}</span>
              </div>
            </div>
            {expanded && (
              <div className="mx-3 mb-3 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {skill.details}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Evidence tab ---------- */

const PROVENANCE_STYLES: Record<string, { badge: string; label: string }> = {
  public_live: { badge: "text-green-700 bg-green-100", label: "Public Live" },
  synthetic_private: { badge: "text-blue-700 bg-blue-100", label: "Synthetic Private" },
  derived: { badge: "text-slate-600 bg-slate-100", label: "Derived" },
};

function EvidenceTab({ evidence }: { evidence: Evidence[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (evidence.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-400">No evidence collected yet</p>
      </div>
    );
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="p-3 space-y-2">
      {evidence.map((ev) => {
        const prov = PROVENANCE_STYLES[ev.provenance] ?? PROVENANCE_STYLES.derived;
        const confPct = Math.round(ev.confidence * 100);
        const confColor =
          ev.confidence >= 0.85
            ? "text-emerald-700 bg-emerald-100"
            : ev.confidence >= 0.7
              ? "text-amber-700 bg-amber-100"
              : "text-red-700 bg-red-100";
        const isExpanded = expandedIds.has(ev.id);
        const needsTruncation = ev.extractedText.length > 200;

        return (
          <div key={ev.id} className="rounded-lg border border-slate-200 bg-white shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-blue-600">{ev.id}</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", prov.badge)}>{prov.label}</span>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", confColor)}>{confPct}%</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mb-2">Source: {ev.source}</div>
            <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-200 rounded p-2">
              {isExpanded || !needsTruncation
                ? ev.extractedText
                : ev.extractedText.slice(0, 200) + "\u2026"}
            </div>
            {needsTruncation && (
              <button
                onClick={() => toggleExpand(ev.id)}
                className="text-[10px] text-blue-600 hover:text-blue-500 mt-1"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Trace tab helpers ---------- */

function parseTraceResultContent(data: Record<string, unknown> | undefined): unknown {
  try {
    const result = data?.result as Record<string, unknown> | undefined;
    const content = (result?.content as string) ?? (data?.content as string) ?? "";
    if (content.startsWith("{") || content.startsWith("[")) return JSON.parse(content);
    if (content) return content;
  } catch { /* ignore */ }
  return null;
}

function formatTraceArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return "(no arguments)";
  return entries
    .map(([k, v]) => {
      const val = typeof v === "string" ? v : JSON.stringify(v);
      const display = val.length > 120 ? val.slice(0, 120) + "…" : val;
      return `${k} = ${display}`;
    })
    .join("\n");
}

function formatTraceResult(data: Record<string, unknown> | undefined, summary: string): string {
  const parsed = parseTraceResultContent(data);
  if (parsed === null) return summary;
  if (typeof parsed === "string") {
    return parsed.length > 150 ? parsed.slice(0, 150) + "…" : parsed;
  }
  if (Array.isArray(parsed)) return `Returned ${parsed.length} item(s)`;
  const obj = parsed as Record<string, unknown>;
  if (obj.title && obj.issueId) return `Issue ${obj.issueId}: ${obj.title}`;
  if (obj.section && typeof obj.section === "object") {
    const sec = obj.section as Record<string, unknown>;
    return sec.name ? `Section "${sec.name}"` : "Memo section updated";
  }
  if (obj.results && Array.isArray(obj.results)) return `${(obj.results as unknown[]).length} result(s)`;
  if (obj.message) return obj.message as string;
  const json = JSON.stringify(obj);
  return json.length > 150 ? json.slice(0, 150) + "…" : json;
}

interface TraceTurnLocal {
  turnNumber: number;
  agentName: string;
  toolCalls: { name: string; args: Record<string, unknown>; result?: string }[];
}

function buildTraceTurns(events: RunEvent[]): TraceTurnLocal[] {
  const turns: TraceTurnLocal[] = [];
  const turnMap = new Map<string, TraceTurnLocal>();

  for (const ev of events) {
    if (ev.type === "tool.invoked") {
      const toolName = (ev.data?.toolName as string) ?? ev.summary;
      const rawArgs = ev.data?.arguments ?? ev.data?.input ?? {};
      const args =
        typeof rawArgs === "string"
          ? (() => { try { return JSON.parse(rawArgs) as Record<string, unknown>; } catch { return {}; } })()
          : (rawArgs as Record<string, unknown>);
      const agentName = ev.actor.replace(/^agent:/, "");
      if (!turnMap.has(agentName)) {
        const turn: TraceTurnLocal = { turnNumber: turns.length + 1, agentName, toolCalls: [] };
        turnMap.set(agentName, turn);
        turns.push(turn);
      }
      turnMap.get(agentName)!.toolCalls.push({ name: toolName, args });
    } else if (ev.type === "tool.completed") {
      const toolName = (ev.data?.toolName as string) ?? ev.summary;
      const result = formatTraceResult(ev.data, ev.summary);
      const agentName = ev.actor.replace(/^agent:/, "");
      const turn = turnMap.get(agentName);
      if (turn) {
        const tc = turn.toolCalls.find((c) => c.name === toolName && !c.result);
        if (tc) tc.result = result;
      }
    }
  }
  return turns;
}

/* ---------- Trace tab ---------- */

function TraceTab({ events }: { events: RunEvent[] }) {
  const turns = useMemo(() => buildTraceTurns(events), [events]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (turns.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-400">No trace data yet</p>
      </div>
    );
  }

  function toggle(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div className="p-3 space-y-2">
      {turns.map((turn) => {
        const isExpanded = expanded.has(turn.turnNumber);
        return (
          <div key={turn.turnNumber} className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => toggle(turn.turnNumber)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
            >
              <span
                className={cn(
                  "text-[10px] text-slate-400 transition-transform",
                  isExpanded && "rotate-90",
                )}
              >
                ▶
              </span>
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold shrink-0">
                {turn.turnNumber}
              </span>
              <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{turn.agentName}</span>
              <span className="text-[11px] text-slate-400">
                {turn.toolCalls.length} tool{turn.toolCalls.length !== 1 ? "s" : ""}
              </span>
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-slate-200 space-y-2 pt-2">
                {turn.toolCalls.map((tc, i) => (
                  <div key={i} className="rounded border border-slate-200 p-2.5">
                    <div className="text-xs font-mono font-semibold text-violet-600 mb-1">{tc.name}</div>
                    <pre className="text-[11px] font-mono text-slate-400 whitespace-pre-wrap break-words mb-1">
                      {formatTraceArgs(tc.args)}
                    </pre>
                    {tc.result && (
                      <div className="text-xs text-slate-700 border-t border-slate-200 pt-1 mt-1">&#8594; {tc.result}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Tools tab ---------- */

function ToolsTab() {
  return (
    <div className="p-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-1.5 px-2 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Tool</th>
            <th className="text-left py-1.5 px-2 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Tier</th>
          </tr>
        </thead>
        <tbody>
          {TOOLS.map((tool) => {
            const tier = TIER_BADGES[tool.tier] ?? TIER_BADGES[0];
            return (
              <tr key={tool.name} className="border-b border-slate-200/50 hover:bg-white/60">
                <td className="py-1.5 px-2">
                  <div className="font-mono text-violet-600 font-medium">{tool.name}</div>
                  <div className="text-slate-400 mt-0.5">{tool.description}</div>
                </td>
                <td className="py-1.5 px-2">
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", tier.cls)}>{tier.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
