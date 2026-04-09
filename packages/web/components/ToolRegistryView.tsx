"use client";

import type { ToolEntry } from "@/lib/api-client";

const HARNESS_TOOLS: ToolEntry[] = [
  { name: "web-research-search", service: "web-research", tier: 0, description: "Search public web sources for company information" },
  { name: "web-research-open_page", service: "web-research", tier: 0, description: "Open and read a cached public web page" },
  { name: "vdr-search_documents", service: "vdr", tier: 0, description: "Search the virtual data room for deal documents" },
  { name: "vdr-open_document", service: "vdr", tier: 0, description: "Open and read a VDR document" },
  { name: "finance-load_kpis", service: "finance", tier: 0, description: "Load key financial metrics and KPIs" },
  { name: "finance-compute_cohorts", service: "finance", tier: 0, description: "Compute retention cohort curves by segment" },
  { name: "finance-revenue_bridge", service: "finance", tier: 0, description: "Generate revenue bridge analysis" },
  { name: "workflow-create_issue", service: "workflow", tier: 1, description: "Create a diligence issue for tracking" },
  { name: "workflow-draft_seller_question", service: "workflow", tier: 2, description: "Draft a question to send to the seller (requires approval)" },
  { name: "workflow-list_issues", service: "workflow", tier: 0, description: "List all created issues" },
  { name: "memo-read_section", service: "memo", tier: 0, description: "Read a memo section" },
  { name: "memo-write_section", service: "memo", tier: 1, description: "Write or update a memo section" },
  { name: "memo-read_full_memo", service: "memo", tier: 0, description: "Read the complete investment memo" },
];

const TIER_CONFIG: Record<number, { color: string; label: string }> = {
  0: { color: "var(--success)", label: "Tier 0 — Auto" },
  1: { color: "var(--warning)", label: "Tier 1 — Notify" },
  2: { color: "var(--danger)", label: "Tier 2 — Approve" },
};

const s = {
  container: { padding: 16 },
  title: { fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 16 },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    textAlign: "left" as const,
    padding: "8px 12px",
    borderBottom: "1px solid var(--border)",
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(31,41,55,0.5)",
    color: "var(--fg)",
    verticalAlign: "top" as const,
  },
  toolName: {
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    color: "#8b5cf6",
    fontSize: 12,
  },
  service: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#9ca3af",
  },
  badge: (color: string) => ({
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    background: color + "22",
    color,
    whiteSpace: "nowrap" as const,
  }),
  desc: { color: "#d1d5db", fontSize: 12 },
};

interface Props {
  tools?: ToolEntry[];
}

export default function ToolRegistryView({ tools }: Props) {
  const displayTools = tools && tools.length > 0 ? tools : HARNESS_TOOLS;

  return (
    <div style={s.container}>
      <div style={s.title}>Tool Registry ({displayTools.length} tools)</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Tool</th>
            <th style={s.th}>Service</th>
            <th style={s.th}>Tier</th>
            <th style={s.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {displayTools.map((tool) => {
            const tier = TIER_CONFIG[tool.tier] ?? TIER_CONFIG[0];
            return (
              <tr key={tool.name}>
                <td style={s.td}>
                  <span style={s.toolName}>{tool.name}</span>
                </td>
                <td style={s.td}>
                  <span style={s.service}>{tool.service}</span>
                </td>
                <td style={s.td}>
                  <span style={s.badge(tier.color)}>{tier.label}</span>
                </td>
                <td style={s.td}>
                  <span style={s.desc}>{tool.description}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
