export type HarnessEventType =
  | "run.started"
  | "run.completed"
  | "run.failed"
  | "agent.delegated"
  | "agent.responded"
  | "tool.invoked"
  | "tool.completed"
  | "tool.failed"
  | "evidence.collected"
  | "claim.evaluated"
  | "contradiction.detected"
  | "issue.created"
  | "issue.resolved"
  | "memo.updated"
  | "approval.requested"
  | "approval.granted"
  | "approval.denied"
  | "session.started"
  | "session.ended"
  | "steer.received"
  | "steer.sent"
  | "message.queued"
  | "artifact.generated"
  | "error.occurred";

export interface HarnessEvent {
  eventId: string;
  eventType: HarnessEventType;
  timestamp: string;
  runId: string;
  actorName: string;
  summary: string;
  payload: Record<string, unknown>;
}
