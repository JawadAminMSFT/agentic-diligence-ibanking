import type { DealWorkspace } from "../state/types.js";

/** Mirrors the SDK's SessionStartHookInput (not re-exported from the package root). */
interface SessionStartHookInput {
  timestamp: number;
  cwd: string;
  source: "startup" | "resume" | "new";
  initialPrompt?: string;
}

/** Mirrors the SDK's SessionStartHookOutput. */
interface SessionStartHookOutput {
  additionalContext?: string;
  modifiedConfig?: Record<string, unknown>;
}

/** Mirrors the SDK's SessionEndHookInput. */
interface SessionEndHookInput {
  timestamp: number;
  cwd: string;
  reason: "complete" | "error" | "abort" | "timeout" | "user_exit";
  finalMessage?: string;
  error?: string;
}

/** Mirrors the SDK's SessionEndHookOutput. */
interface SessionEndHookOutput {
  suppressOutput?: boolean;
  cleanupActions?: string[];
  sessionSummary?: string;
}

export function createOnSessionStartHook(workspace: DealWorkspace) {
  return function onSessionStart(
    _input: SessionStartHookInput,
    invocation: { sessionId: string }
  ): SessionStartHookOutput {
    const summary = [
      `Deal: ${workspace.codeName} (${workspace.dealId})`,
      `Status: ${workspace.status}`,
      `Stage: ${workspace.currentStage}`,
      `Data Package Version: ${workspace.dataPackageVersion}`,
      `Existing Evidence Items: ${workspace.evidence.length}`,
      `Existing Claims: ${workspace.claims.length}`,
      `Open Issues: ${workspace.issues.filter((i) => i.status === "open").length}`,
      `Memo Sections: ${workspace.memoSections.length}`,
    ].join("\n");

    console.log(
      `[session-lifecycle] Session ${invocation.sessionId} started`
    );
    console.log(`[session-lifecycle] Workspace summary:\n${summary}`);

    return { additionalContext: summary };
  };
}

export function createOnSessionEndHook() {
  return function onSessionEnd(
    input: SessionEndHookInput,
    invocation: { sessionId: string }
  ): SessionEndHookOutput {
    console.log(
      `[session-lifecycle] Session ${invocation.sessionId} ended (reason: ${input.reason})`
    );
    if (input.finalMessage) {
      console.log(
        `[session-lifecycle] Final message: ${input.finalMessage}`
      );
    }

    return {
      sessionSummary: `Session ${invocation.sessionId} completed with reason: ${input.reason}`,
    };
  };
}
