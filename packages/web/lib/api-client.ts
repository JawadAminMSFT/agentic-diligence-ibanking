const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

export interface Session {
  runId: string;
  dealName: string;
  status: "running" | "paused" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface RunEvent {
  id: string;
  timestamp: string;
  type: string;
  actor: string;
  summary: string;
  data?: Record<string, unknown>;
}

export interface MemoSection {
  title: string;
  content: string;
  confidence: number;
  evidenceIds: string[];
}

export interface Issue {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  workstream: string;
  description: string;
  nextAction: string;
}

export interface Evidence {
  id: string;
  source: string;
  extractedText: string;
  confidence: number;
  provenance: "public_live" | "synthetic_private" | "derived";
}

export interface ToolEntry {
  name: string;
  service: string;
  tier: 0 | 1 | 2;
  description: string;
}

export interface TraceTurn {
  turnNumber: number;
  agentName: string;
  toolCalls: { name: string; args: Record<string, unknown>; result?: string }[];
  thinking?: string;
}

export interface DealInfo {
  dealId: string;
  codeName: string;
  sector: string;
  description: string;
  targetARR: string;
  targetGrowth: string;
  keyMetric: string;
}

export async function fetchDeals(): Promise<DealInfo[]> {
  const res = await fetch(`${API_BASE}/api/deals`);
  if (!res.ok) return [];
  return res.json();
}

export async function startRun(prompt: string, dealId?: string): Promise<{ runId: string }> {
  const res = await fetch(`${API_BASE}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, dealId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to start run: ${res.status}`);
  }
  return res.json();
}

export async function startReplay(): Promise<{ runId: string }> {
  const res = await fetch(`${API_BASE}/api/replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) throw new Error(`Failed to start replay: ${res.status}`);
  return res.json();
}

export function getEvents(runId: string): EventSource {
  return new EventSource(`${API_BASE}/api/run/${runId}/events`);
}

export async function sendSteering(runId: string, message: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/run/${runId}/steer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Failed to send steering: ${res.status}`);
}

export async function sendQueued(runId: string, message: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/run/${runId}/queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Failed to queue message: ${res.status}`);
}

export async function approveAction(
  runId: string,
  actionId: string,
  approved: boolean,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/run/${runId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actionId, approved }),
  });
  if (!res.ok) throw new Error(`Failed to approve action: ${res.status}`);
}

export interface Artifact {
  filename: string;
  type: "memo" | "deck" | "dashboard" | "model" | "other";
  format: string;
  size: number;
  createdAt: string;
  url: string;
}

export async function fetchArtifacts(runId: string): Promise<Artifact[]> {
  const res = await fetch(`${API_BASE}/api/run/${runId}/artifacts`);
  if (!res.ok) return [];
  return res.json();
}

export function getArtifactUrl(runId: string, filename: string): string {
  return `${API_BASE}/api/run/${runId}/artifacts/${filename}`;
}

export interface DealDocument {
  documentId: string;
  title: string;
  category: string;
  snippet: string;
  uploadedAt: string;
}

export async function fetchDealDocuments(dealId: string): Promise<DealDocument[]> {
  const res = await fetch(`${API_BASE}/api/deals/${dealId}/documents`);
  if (!res.ok) return [];
  return res.json();
}

export async function listSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/api/run`);
  if (!res.ok) return [];
  return res.json();
}
