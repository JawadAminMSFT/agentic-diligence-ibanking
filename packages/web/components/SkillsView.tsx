"use client";

interface Skill {
  name: string;
  displayName: string;
  description: string;
  category: "methodology" | "specialist" | "output";
  content: string;
}

const HARNESS_SKILLS: Skill[] = [
  {
    name: "diligence-methodology",
    displayName: "Diligence Methodology",
    description: "M&A diligence best practices and methodology",
    category: "methodology",
    content: `1. Start with public context to form an independent view before reviewing private materials
2. Compare management claims against independently sourced data
3. Identify contradictions between public and private sources
4. Quantify risks with evidence-backed confidence scores
5. Surface issues that require seller follow-up
6. Draft memo sections incrementally as evidence accumulates`,
  },
  {
    name: "evidence-rules",
    displayName: "Evidence Rules",
    description: "Rules for provenance labeling, confidence scoring, and evidence linking",
    category: "methodology",
    content: `• public_live — data from public web sources (news, filings, reviews)
• synthetic_private — data from the VDR or finance systems
• derived — conclusions drawn from combining sources

Confidence scoring: 0.9+ = verified from multiple sources, 0.7-0.9 = single reliable source, <0.7 = inferred or partial data`,
  },
  {
    name: "contradiction-detection",
    displayName: "Contradiction Detection",
    description: "How to detect and flag contradictions between sources",
    category: "methodology",
    content: `A contradiction exists when:
• A public claim directly conflicts with private data
• Segment-level data contradicts blended metrics
• Financial statements don't reconcile with KPI workbooks
• Management narrative doesn't match documented evidence

Action: Create an issue via workflow-create_issue with severity based on materiality.`,
  },
  {
    name: "commercial-analysis",
    displayName: "Commercial Analysis",
    description: "Commercial due diligence analysis methodology",
    category: "specialist",
    content: `Focus areas:
• Customer concentration — flag if top 5 customers exceed 25% of ARR
• Market claims — cross-reference TAM/growth against independent sources
• Competitive positioning — validate market share and differentiation
• Revenue quality — organic vs acquisition-driven growth
• Management narrative — compare CIM story against public data`,
  },
  {
    name: "financial-analysis",
    displayName: "Financial Analysis",
    description: "Financial due diligence analysis methodology",
    category: "specialist",
    content: `Focus areas:
• KPI integrity — check segment-level metrics (blended numbers mask problems)
• Cohort analysis — look for SMB deterioration hidden by enterprise strength
• Revenue bridge — reconcile against CIM claims, find gaps
• Unit economics — CAC payback, LTV/CAC, S&M efficiency
• Churn trends — quarter-over-quarter matters more than point-in-time`,
  },
  {
    name: "legal-analysis",
    displayName: "Legal Analysis",
    description: "Legal due diligence analysis methodology",
    category: "specialist",
    content: `Focus areas:
• Change-of-control — check contracts for CoC termination rights, quantify revenue at risk
• Assignment clauses — verify contracts assignable without consent
• IP ownership — confirm clean ownership, no encumbrances
• Liability caps — review indemnification provisions
• Missing documents — flag expected docs not in VDR`,
  },
  {
    name: "memo-format",
    displayName: "Memo Format",
    description: "IC memo structure and formatting guidelines",
    category: "output",
    content: `Standard IC memo sections:
1. Executive Summary — deal thesis, key metrics, overall assessment
2. Commercial — market position, customers, competitive landscape
3. Financial — revenue, retention, unit economics, anomalies
4. Legal — contracts, IP, compliance, structural risks
5. Open Issues — ranked by severity with next actions
6. Recommendation — proceed / pass / conditional with terms`,
  },
];

const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
  methodology: { color: "#3b82f6", label: "Methodology" },
  specialist: { color: "#8b5cf6", label: "Specialist" },
  output: { color: "#22c55e", label: "Output" },
};

const st = {
  container: { padding: 16 } as React.CSSProperties,
  title: {
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: 16,
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  } as React.CSSProperties,
  card: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius, 6px)",
    padding: 16,
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  } as React.CSSProperties,
  icon: {
    fontSize: 18,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    flexShrink: 0,
  } as React.CSSProperties,
  skillName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--fg)",
  } as React.CSSProperties,
  description: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    background: color + "22",
    color,
    textTransform: "uppercase" as const,
    marginLeft: "auto",
    flexShrink: 0,
  }) as React.CSSProperties,
  content: {
    fontSize: 12,
    color: "#d1d5db",
    lineHeight: 1.7,
    whiteSpace: "pre-line" as const,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius, 6px)",
    padding: 12,
    marginTop: 8,
  } as React.CSSProperties,
  summary: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
    fontSize: 13,
  } as React.CSSProperties,
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#9ca3af",
  } as React.CSSProperties,
  dot: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }) as React.CSSProperties,
};

export default function SkillsView() {
  const methodologyCount = HARNESS_SKILLS.filter((s) => s.category === "methodology").length;
  const specialistCount = HARNESS_SKILLS.filter((s) => s.category === "specialist").length;
  const outputCount = HARNESS_SKILLS.filter((s) => s.category === "output").length;

  return (
    <div style={st.container}>
      <div style={st.title}>Loaded Skills</div>

      <div style={st.summary}>
        <span style={st.summaryItem}>
          <span style={st.dot(CATEGORY_CONFIG.methodology.color)} />
          {methodologyCount} Methodology
        </span>
        <span style={st.summaryItem}>
          <span style={st.dot(CATEGORY_CONFIG.specialist.color)} />
          {specialistCount} Specialist
        </span>
        <span style={st.summaryItem}>
          <span style={st.dot(CATEGORY_CONFIG.output.color)} />
          {outputCount} Output
        </span>
        <span style={{ ...st.summaryItem, marginLeft: "auto", color: "#6b7280" }}>
          {HARNESS_SKILLS.length} skills loaded via SKILL.md
        </span>
      </div>

      <div style={st.grid}>
        {HARNESS_SKILLS.map((skill) => {
          const cat = CATEGORY_CONFIG[skill.category];
          return (
            <div key={skill.name} style={st.card}>
              <div style={st.cardHeader}>
                <div style={{ ...st.icon, background: cat.color + "22", color: cat.color }}>
                  {skill.category === "methodology" ? "📋" : skill.category === "specialist" ? "🔍" : "📝"}
                </div>
                <div>
                  <div style={st.skillName}>{skill.displayName}</div>
                  <div style={st.description}>{skill.description}</div>
                </div>
                <span style={st.badge(cat.color)}>{cat.label}</span>
              </div>
              <div style={st.content}>{skill.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
