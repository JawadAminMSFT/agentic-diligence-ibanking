"use client";

import { useState } from "react";

interface PendingAction {
  actionId: string;
  description: string;
  agent: string;
  toolName: string;
  args: Record<string, unknown>;
  risk: "low" | "medium" | "high";
}

const MOCK_ACTION: PendingAction = {
  actionId: "act-001",
  description: "The financial analyst wants to access a paid data source (PitchBook) to retrieve detailed cap table information for Acme Corp.",
  agent: "financial-analyst",
  toolName: "pitchbook_query",
  args: { company: "Acme Corp", dataType: "cap_table" },
  risk: "medium",
};

const RISK_COLORS: Record<string, string> = {
  low: "var(--success)",
  medium: "var(--warning)",
  high: "var(--danger)",
};

const s = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: 440,
    maxWidth: "100vw",
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column" as const,
    animation: "slideIn 0.2s ease-out",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 15, fontWeight: 600, color: "var(--fg)" },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 18,
    cursor: "pointer",
    padding: 4,
  },
  body: {
    flex: 1,
    overflow: "auto",
    padding: 20,
  },
  section: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6, display: "block" },
  value: { fontSize: 14, color: "var(--fg)", lineHeight: 1.6 },
  badge: (color: string) => ({
    display: "inline-block",
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 10,
    background: color + "22",
    color,
    textTransform: "uppercase" as const,
  }),
  codeBlock: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 12,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#d1d5db",
    overflow: "auto",
    whiteSpace: "pre-wrap" as const,
  },
  footer: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    gap: 10,
  },
  approveBtn: {
    flex: 1,
    padding: "10px 16px",
    background: "var(--success)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  rejectBtn: {
    flex: 1,
    padding: "10px 16px",
    background: "transparent",
    color: "var(--danger)",
    border: "1px solid var(--danger)",
    borderRadius: "var(--radius)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
};

interface Props {
  action?: PendingAction | null;
  open?: boolean;
  onClose?: () => void;
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string) => void;
}

export default function ApprovalDrawer({
  action: externalAction,
  open: externalOpen,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [demoOpen, setDemoOpen] = useState(false);
  const isOpen = externalOpen ?? demoOpen;
  const action = externalAction ?? MOCK_ACTION;

  if (!isOpen) {
    // Render a trigger button when used standalone
    if (externalOpen === undefined) {
      return (
        <button
          onClick={() => setDemoOpen(true)}
          style={{
            padding: "6px 14px",
            background: "rgba(249,115,22,0.15)",
            color: "#f97316",
            border: "1px solid rgba(249,115,22,0.3)",
            borderRadius: "var(--radius)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          1 Pending Approval
        </button>
      );
    }
    return null;
  }

  const riskColor = RISK_COLORS[action.risk] ?? "#6b7280";

  return (
    <div style={s.overlay} onClick={() => (onClose ?? (() => setDemoOpen(false)))()}>
      <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <span style={s.headerTitle}>Approval Required</span>
          <button
            style={s.closeBtn}
            onClick={() => (onClose ?? (() => setDemoOpen(false)))()}
          >
            ✕
          </button>
        </div>
        <div style={s.body}>
          <div style={s.section}>
            <span style={s.label}>Description</span>
            <div style={s.value}>{action.description}</div>
          </div>
          <div style={s.section}>
            <span style={s.label}>Agent</span>
            <div style={s.value}>{action.agent}</div>
          </div>
          <div style={s.section}>
            <span style={s.label}>Tool</span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#8b5cf6" }}>
              {action.toolName}
            </div>
          </div>
          <div style={s.section}>
            <span style={s.label}>Arguments</span>
            <div style={s.codeBlock}>{JSON.stringify(action.args, null, 2)}</div>
          </div>
          <div style={s.section}>
            <span style={s.label}>Risk Level</span>
            <span style={s.badge(riskColor)}>{action.risk}</span>
          </div>
        </div>
        <div style={s.footer}>
          <button
            style={s.rejectBtn}
            onClick={() => (onReject ?? (() => setDemoOpen(false)))(action.actionId)}
          >
            Reject
          </button>
          <button
            style={s.approveBtn}
            onClick={() => (onApprove ?? (() => setDemoOpen(false)))(action.actionId)}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
