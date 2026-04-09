"use client";

import type { MemoSection } from "@/lib/api-client";


function confidenceColor(score: number): string {
  if (score >= 0.85) return "var(--success)";
  if (score >= 0.7) return "var(--warning)";
  return "var(--danger)";
}

const s = {
  container: { padding: 16 },
  title: { fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 16 },
  section: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 16,
    marginBottom: 12,
    background: "var(--surface)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "var(--fg)" },
  badge: (color: string) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 10,
    background: color + "18",
    color,
  }),
  content: {
    fontSize: 13,
    lineHeight: 1.7,
    color: "#d1d5db",
    marginBottom: 10,
  },
  evidenceRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  evidenceLink: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 4,
    background: "rgba(59,130,246,0.1)",
    color: "var(--accent)",
    cursor: "pointer",
    border: "none",
    fontFamily: "var(--font-mono)",
  },
  empty: {
    textAlign: "center" as const,
    padding: 48,
    color: "#4b5563",
    fontSize: 13,
  },
};

interface Props {
  sections?: MemoSection[];
  onEvidenceClick?: (evidenceId: string) => void;
}

export default function MemoViewer({ sections = [], onEvidenceClick }: Props) {
  if (sections.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.title}>Investment Memo</div>
        <div style={s.empty}>No memo sections yet. Memo will populate as the agent writes findings.</div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.title}>Investment Memo</div>
      {sections.map((section, i) => {
        const color = confidenceColor(section.confidence);
        return (
          <div key={i} style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>{section.title}</span>
              <span style={s.badge(color)}>
                {Math.round(section.confidence * 100)}% confidence
              </span>
            </div>
            <div style={s.content}>{section.content}</div>
            {section.evidenceIds.length > 0 && (
              <div style={s.evidenceRow}>
                <span style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Evidence:</span>
                {section.evidenceIds.map((eid: string) => (
                  <button
                    key={eid}
                    style={s.evidenceLink}
                    onClick={() => onEvidenceClick?.(eid)}
                  >
                    {eid}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
