import { getToolTier, type ToolTier } from "../tools/registry.js";

/** Mirrors the SDK's PreToolUseHookInput (not re-exported from the package root). */
interface PreToolUseHookInput {
  timestamp: number;
  cwd: string;
  toolName: string;
  toolArgs: unknown;
}

/** Mirrors the SDK's PreToolUseHookOutput. */
interface PreToolUseHookOutput {
  permissionDecision?: "allow" | "deny" | "ask";
  permissionDecisionReason?: string;
  modifiedArgs?: unknown;
  additionalContext?: string;
  suppressOutput?: boolean;
}

export interface ApprovalRequest {
  toolName: string;
  input: unknown;
  tier: ToolTier;
  timestamp: string;
}

export type ApprovalCallback = (request: ApprovalRequest) => void;

export function createApprovalGateHook(onApprovalNeeded?: ApprovalCallback) {
  return function onPreToolUse(
    input: PreToolUseHookInput,
    _invocation: { sessionId: string }
  ): PreToolUseHookOutput {
    const tier = getToolTier(input.toolName);

    switch (tier) {
      case 0:
        return { permissionDecision: "allow" };

      case 1:
        console.log(
          `[approval-gate] Tier 1 tool invoked: ${input.toolName}`,
          JSON.stringify(input.toolArgs)
        );
        return { permissionDecision: "allow" };

      case 2: {
        const request: ApprovalRequest = {
          toolName: input.toolName,
          input: input.toolArgs,
          tier,
          timestamp: new Date().toISOString(),
        };

        if (onApprovalNeeded) {
          onApprovalNeeded(request);
        }

        return {
          permissionDecision: "deny",
          permissionDecisionReason:
            "Requires human approval. An approval request has been queued.",
        };
      }

      default:
        return { permissionDecision: "allow" };
    }
  };
}
