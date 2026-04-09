"use client";

import { useState } from "react";
import { sendSteering, sendQueued } from "@/lib/api-client";

const s = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    flexWrap: "wrap" as const,
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 180,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap" as const,
  },
  input: {
    flex: 1,
    padding: "6px 10px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--fg)",
    fontSize: 13,
    outline: "none",
    minWidth: 0,
  },
  sendBtn: {
    padding: "6px 12px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  pauseBtn: (paused: boolean) => ({
    padding: "6px 14px",
    background: paused ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
    color: paused ? "var(--success)" : "var(--danger)",
    border: "1px solid " + (paused ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"),
    borderRadius: "var(--radius)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  }),
  statusDot: (status: string) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background:
      status === "running"
        ? "var(--success)"
        : status === "paused"
          ? "var(--warning)"
          : status === "completed"
            ? "var(--accent)"
            : "var(--danger)",
    flexShrink: 0,
  }),
  statusLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  },
};

interface Props {
  runId: string;
  status?: "running" | "paused" | "completed" | "failed";
  onPauseToggle?: () => void;
}

export default function SessionControls({ runId, status = "running", onPauseToggle }: Props) {
  const [steerMsg, setSteerMsg] = useState("");
  const [queueMsg, setQueueMsg] = useState("");
  const [sending, setSending] = useState<"steer" | "queue" | null>(null);

  async function handleSteer() {
    if (!steerMsg.trim()) return;
    setSending("steer");
    try {
      await sendSteering(runId, steerMsg.trim());
      setSteerMsg("");
    } catch {
      // silently fail for now
    } finally {
      setSending(null);
    }
  }

  async function handleQueue() {
    if (!queueMsg.trim()) return;
    setSending("queue");
    try {
      await sendQueued(runId, queueMsg.trim());
      setQueueMsg("");
    } catch {
      // silently fail for now
    } finally {
      setSending(null);
    }
  }

  const isPaused = status === "paused";

  return (
    <div style={s.container}>
      <div style={s.statusDot(status)} />
      <span style={s.statusLabel}>{status}</span>

      <div style={s.inputGroup}>
        <span style={s.label}>Steer</span>
        <input
          style={s.input}
          placeholder="Send steering message…"
          value={steerMsg}
          onChange={(e) => setSteerMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSteer()}
          disabled={status === "completed" || status === "failed"}
        />
        <button
          style={{ ...s.sendBtn, opacity: !steerMsg.trim() || sending === "steer" ? 0.5 : 1 }}
          onClick={handleSteer}
          disabled={!steerMsg.trim() || sending === "steer"}
        >
          Send
        </button>
      </div>

      <div style={s.inputGroup}>
        <span style={s.label}>Queue</span>
        <input
          style={s.input}
          placeholder="Queue message for next turn…"
          value={queueMsg}
          onChange={(e) => setQueueMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQueue()}
          disabled={status === "completed" || status === "failed"}
        />
        <button
          style={{ ...s.sendBtn, opacity: !queueMsg.trim() || sending === "queue" ? 0.5 : 1 }}
          onClick={handleQueue}
          disabled={!queueMsg.trim() || sending === "queue"}
        >
          Queue
        </button>
      </div>

      <button
        style={s.pauseBtn(isPaused)}
        onClick={onPauseToggle}
        disabled={status === "completed" || status === "failed"}
      >
        {isPaused ? "▶ Resume" : "⏸ Pause"}
      </button>
    </div>
  );
}
