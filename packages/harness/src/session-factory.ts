import {
  CopilotClient,
  type CopilotSession,
  type SessionEventHandler,
  approveAll,
} from "@github/copilot-sdk";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { HarnessConfig } from "./client.js";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "./agents/orchestrator-prompt.js";
import { createApprovalGateHook } from "./hooks/approval-gate.js";
import { createProvenanceTaggerHook } from "./hooks/provenance-tagger.js";
import {
  createOnSessionStartHook,
  createOnSessionEndHook,
} from "./hooks/session-lifecycle.js";
import { createErrorHandlerHook } from "./hooks/error-handler.js";
import { createEventBridge, type HarnessEventCallback } from "./events/bridge.js";
import type { ApprovalRequest } from "./hooks/approval-gate.js";
import type { DealWorkspace } from "./state/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SessionConfig {
  harnessConfig: HarnessConfig;
  workspace: DealWorkspace;
  onEvent?: HarnessEventCallback;
  onApprovalNeeded?: (request: ApprovalRequest) => void;
}

export async function createDiligenceSession(
  client: CopilotClient,
  config: SessionConfig
): Promise<{ session: CopilotSession; sessionId: string; runId: string }> {
  const { harnessConfig, workspace, onEvent, onApprovalNeeded } = config;
  const runId = uuidv4();
  const timestamp = Date.now();
  const sessionId = `deal-${workspace.dealId}-run-${timestamp}`;

  const approvalGate = createApprovalGateHook(onApprovalNeeded);
  const provenanceTagger = createProvenanceTaggerHook();
  const sessionStartHook = createOnSessionStartHook(workspace);
  const sessionEndHook = createOnSessionEndHook();
  const errorHook = createErrorHandlerHook();

  const bridge = onEvent ? createEventBridge(runId, onEvent) : null;
  const eventHandler: SessionEventHandler | undefined = bridge
    ? (event) => {
        bridge({ type: event.type, data: event.data as Record<string, unknown> });
      }
    : undefined;

  const skillsDir = path.resolve(__dirname, "skills");

  // Resolve MCP server paths relative to this file's location
  const mcpRoot = path.resolve(__dirname, "..", "..", "mcp-servers", "dist");

  const dealEnv = { DEAL_ID: workspace.dealId ?? "atlas" };

  const session = await client.createSession({
    sessionId,
    model: harnessConfig.model ?? harnessConfig.azureDeployment,
    systemMessage: {
      mode: "replace",
      content: ORCHESTRATOR_SYSTEM_PROMPT,
    },
    provider: {
      type: "openai",
      baseUrl: harnessConfig.azureEndpoint,
      wireApi: "responses",
      ...(harnessConfig.bearerToken
        ? { bearerToken: harnessConfig.bearerToken }
        : { apiKey: harnessConfig.apiKey }),
    },
    streaming: true,
    onPermissionRequest: approveAll,
    mcpServers: {
      "web-research": {
        type: "stdio",
        command: "node",
        args: [path.join(mcpRoot, "web-research", "server.js")],
        env: dealEnv,
        tools: ["*"],
      },
      vdr: {
        type: "stdio",
        command: "node",
        args: [path.join(mcpRoot, "vdr", "server.js")],
        env: dealEnv,
        tools: ["*"],
      },
      finance: {
        type: "stdio",
        command: "node",
        args: [path.join(mcpRoot, "finance", "server.js")],
        env: dealEnv,
        tools: ["*"],
      },
      workflow: {
        type: "stdio",
        command: "node",
        args: [path.join(mcpRoot, "workflow", "server.js")],
        env: dealEnv,
        tools: ["*"],
      },
      memo: {
        type: "stdio",
        command: "node",
        args: [path.join(mcpRoot, "memo", "server.js")],
        env: dealEnv,
        tools: ["*"],
      },
      artifacts: {
        type: "stdio",
        command: "node",
        args: [path.join(mcpRoot, "artifacts", "server.js")],
        env: {
          DEAL_ID: workspace.dealId ?? "atlas",
          ARTIFACTS_DIR: path.resolve(process.cwd(), "artifacts", runId),
        },
        tools: ["*"],
      },
    },
    skillDirectories: [skillsDir],
    hooks: {
      onPreToolUse: approvalGate,
      onPostToolUse: provenanceTagger,
      onSessionStart: sessionStartHook,
      onSessionEnd: sessionEndHook,
      onErrorOccurred: errorHook,
    },
    onEvent: eventHandler,
  });

  return { session, sessionId, runId };
}
