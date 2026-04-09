import "dotenv/config";
import { createCopilotClient, loadConfigFromEnv } from "./client.js";
import { createDiligenceSession } from "./session-factory.js";
import type { DealWorkspace } from "./state/types.js";
import type { HarnessEvent } from "./events/types.js";
import { TraceStore } from "./events/trace-store.js";

const SEED_WORKSPACE: DealWorkspace = {
  dealId: "demo-001",
  codeName: "Project Atlas",
  status: "active",
  currentStage: "initial-review",
  dataPackageVersion: "1.0.0",
  claims: [],
  issues: [],
  memoSections: [],
  evidence: [],
  contradictions: [],
  toolHistory: [],
};

async function main() {
  console.log("=== Diligence Agentic Harness ===\n");

  const config = loadConfigFromEnv();
  console.log(
    `Azure endpoint: ${config.azureEndpoint}`,
    `\nDeployment: ${config.azureDeployment}`,
    `\nAuth mode: ${config.authMode}\n`
  );

  console.log("Starting Copilot client...");
  const client = await createCopilotClient();

  const traceStore = new TraceStore();

  const onEvent = (event: HarnessEvent) => {
    traceStore.append(event);
    const icon = getEventIcon(event.eventType);
    console.log(`${icon} [${event.eventType}] ${event.summary}`);
  };

  console.log("Creating diligence session...\n");
  const { session, sessionId, runId } = await createDiligenceSession(client, {
    harnessConfig: config,
    workspace: SEED_WORKSPACE,
    onEvent,
    onApprovalNeeded: (request) => {
      console.log(
        `\n⚠️  APPROVAL NEEDED: ${request.toolName}\n` +
          `   Input: ${JSON.stringify(request.input)}\n`
      );
    },
  });

  console.log(`Session: ${sessionId}`);
  console.log(`Run:     ${runId}\n`);

  const prompt =
    process.argv[2] ??
    `Begin due diligence analysis for deal ${SEED_WORKSPACE.codeName}. ` +
      `Start by forming an independent public view of the target company, ` +
      `then review VDR materials and identify any contradictions.`;

  console.log(`Prompt: ${prompt}\n`);
  console.log("--- Streaming events ---\n");

  // Subscribe to streaming events
  session.on((event) => {
    if (event.type === "assistant.message") {
      const data = event.data as { content?: string };
      if (data.content) {
        process.stdout.write(data.content);
      }
    }
  });

  // Send message and wait for completion (5 minute timeout for multi-turn diligence)
  await session.sendAndWait({ prompt }, 300_000);

  console.log("\n\n--- Run complete ---");
  console.log(`Total events: ${traceStore.count()}`);

  await session.disconnect();
  await client.stop();
}

function getEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    "run.started": "🚀",
    "run.completed": "✅",
    "run.failed": "❌",
    "agent.delegated": "🤖",
    "agent.responded": "💬",
    "tool.invoked": "🔧",
    "tool.completed": "✔️",
    "tool.failed": "⚠️",
    "evidence.collected": "📋",
    "claim.evaluated": "📊",
    "contradiction.detected": "⚡",
    "issue.created": "🔴",
    "memo.updated": "📝",
    "approval.requested": "🔒",
    "session.started": "▶️",
    "session.ended": "⏹️",
    "error.occurred": "💥",
  };
  return icons[eventType] ?? "•";
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
