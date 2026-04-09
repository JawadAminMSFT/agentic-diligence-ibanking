import type { ToolResultObject } from "@github/copilot-sdk";
import type { ProvenanceType } from "../state/types.js";
import { getToolEntry } from "../tools/registry.js";

/** Mirrors the SDK's PostToolUseHookInput (not re-exported from the package root). */
interface PostToolUseHookInput {
  timestamp: number;
  cwd: string;
  toolName: string;
  toolArgs: unknown;
  toolResult: ToolResultObject;
}

/** Mirrors the SDK's PostToolUseHookOutput. */
interface PostToolUseHookOutput {
  modifiedResult?: ToolResultObject;
  additionalContext?: string;
  suppressOutput?: boolean;
}

const SERVER_PROVENANCE_MAP: Record<string, ProvenanceType> = {
  "web-research": "public_live",
  vdr: "synthetic_private",
  finance: "synthetic_private",
  workflow: "derived",
  memo: "derived",
};

export function createProvenanceTaggerHook() {
  return function onPostToolUse(
    input: PostToolUseHookInput,
    _invocation: { sessionId: string }
  ): PostToolUseHookOutput {
    const entry = getToolEntry(input.toolName);
    const mcpServer = entry?.mcpServer ?? "unknown";
    const provenanceType: ProvenanceType =
      SERVER_PROVENANCE_MAP[mcpServer] ?? "derived";

    return {
      additionalContext: JSON.stringify({
        provenance: {
          provenanceType,
          sourceName: mcpServer,
          taggedAt: new Date().toISOString(),
        },
      }),
    };
  };
}
