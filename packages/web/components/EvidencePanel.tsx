"use client";

import type { Evidence } from "@/lib/api-client";


const PROVENANCE_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  public_live: { bg: "rgba(34,197,94,0.15)", fg: "var(--success)", label: "Public Live" },
  synthetic_private: { bg: "rgba(59,130,246,0.15)", fg: "var(--accent)", label: "Synthetic Private" },
  derived: { bg: "rgba(107,114,128,0.15)", fg: "#9ca3af", label: "Derived" },
};

function confidenceColor(score: number): string {
  if (score >= 0.85) return "var(--success)";
  if (score >= 0.7) return "var(--warning)";
  return "var(--danger)";
}

const s = {
  container: { padding: 16 },
  title: { fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 16 },
  card: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 14,
    marginBottom: 10,
    background: "var(--surface)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  evidenceId: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--accent)" },
  badges: { display: "flex", gap: 6, alignItems: "center" },
  badge: (bg: string, fg: string) => ({
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    background: bg,
    color: fg,
  }),
  source: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
  text: {
    fontSize: 13,
    lineHeight: 1.7,
    color: "#d1d5db",
    padding: 12,
    background: "var(--bg)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
  },
  empty: { textAlign: "center" as const, padding: 48, color: "#4b5563", fontSize: 13 },
};

interface Props {
  evidence?: Evidence[];
  highlightId?: string | null;
}

export default function EvidencePanel({ evidence = [], highlightId }: Props) {
  return (
    <div style={s.container}>
      <div style={s.title}>Evidence ({evidence.length})</div>
      {evidence.length === 0 ? (
        <div style={s.empty}>No evidence collected yet. Evidence will appear as tools gather data.</div>
      ) : (
        evidence.map((ev) => {
          const prov = PROVENANCE_COLORS[ev.provenance] ?? PROVENANCE_COLORS.derived;
          const cColor = confidenceColor(ev.confidence);
          const isHighlighted = highlightId === ev.id;
          return (
            <div
              key={ev.id}
              id={`evidence-${ev.id}`}
              style={{
                ...s.card,
                borderColor: isHighlighted ? "var(--accent)" : "var(--border)",
                boxShadow: isHighlighted ? "0 0 0 1px var(--accent)" : "none",
              }}
            >
              <div style={s.cardHeader}>
                <span style={s.evidenceId}>{ev.id}</span>
                <div style={s.badges}>
                  <span style={s.badge(prov.bg, prov.fg)}>{prov.label}</span>
                  <span style={s.badge(cColor + "18", cColor)}>
                    {Math.round(ev.confidence * 100)}%
                  </span>
                </div>
              </div>
              <div style={s.source}>Source: {ev.source}</div>
              <div style={s.text}>{ev.extractedText}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
