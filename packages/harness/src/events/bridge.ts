import { v4 as uuidv4 } from "uuid";
import type { HarnessEvent, HarnessEventType } from "./types.js";

export type HarnessEventCallback = (event: HarnessEvent) => void;

export interface StreamEvent {
  type: string;
  data?: Record<string, unknown>;
}

// SDK event types worth surfacing in the harness UI
const MEANINGFUL_EVENTS: Record<string, HarnessEventType> = {
  // Tool execution
  "tool.execution_start": "tool.invoked",
  "tool.execution_complete": "tool.completed",

  // Sub-agent orchestration
  "subagent.started": "agent.delegated",
  "subagent.completed": "agent.responded",
  "subagent.failed": "error.occurred",

  // Session lifecycle
  "session.start": "session.started",
  "session.idle": "session.ended",
  "session.task_complete": "run.completed",
  "session.error": "error.occurred",

  // User messages
  "user.message": "steer.received",

  // Assistant content — only the final message per turn, not deltas
  "assistant.message": "agent.responded",
};

/** Safely parse the nested result.content JSON string from tool output. */
function parseResultContent(data: Record<string, unknown>): Record<string, unknown> {
  try {
    const result = data.result as Record<string, unknown> | undefined;
    const content = (result?.content as string) ?? "";
    if (content.startsWith("{") || content.startsWith("[")) return JSON.parse(content);
  } catch { /* ignore malformed JSON */ }
  return {};
}

function summarizeToolStart(toolName: string, data: Record<string, unknown>): string {
  const args = data.arguments ?? data.input ?? {};
  const argsObj = typeof args === "string" ? (() => { try { return JSON.parse(args); } catch { return {}; } })() : args;
  const a = argsObj as Record<string, unknown>;

  if (toolName === "web-research-search") {
    const query = (a.query as string) ?? "";
    return `Searching public sources: "${query.length > 80 ? query.slice(0, 80) + "…" : query}"`;
  }
  if (toolName === "vdr-search_documents") {
    const query = (a.query as string) ?? "";
    return `Searching VDR: "${query.length > 80 ? query.slice(0, 80) + "…" : query}"`;
  }
  if (toolName === "vdr-open_document") {
    const docId = (a.documentId as string) ?? (a.id as string) ?? "";
    return `Opening VDR document: ${docId}`;
  }
  if (toolName === "finance-load_kpis") return "Loading financial KPIs";
  if (toolName === "finance-compute_cohorts") return "Computing cohort analysis";
  if (toolName === "finance-revenue_bridge") return "Generating revenue bridge";
  if (toolName === "workflow-create_issue") {
    const title = (a.title as string) ?? "";
    return title ? `Creating issue: ${title.slice(0, 80)}` : "Creating issue";
  }
  if (toolName === "workflow-draft_seller_question") return "Drafting seller question";
  if (toolName === "workflow-list_issues") return "Listing issues";
  if (toolName === "memo-write_section") {
    const name = (a.sectionName as string) ?? (a.name as string) ?? "";
    return name ? `Writing memo section: ${name}` : "Writing memo section";
  }
  if (toolName === "memo-read_section") {
    const name = (a.sectionName as string) ?? (a.name as string) ?? "";
    return name ? `Reading memo section: ${name}` : "Reading memo section";
  }
  if (toolName === "memo-read_full_memo") return "Reading full memo";

  if (toolName === "artifacts-generate_memo_pdf") return "Generating memo PDF";
  if (toolName === "artifacts-generate_deck") return "Generating summary presentation deck";
  if (toolName === "artifacts-generate_dashboard") return "Generating interactive dashboard";
  if (toolName === "artifacts-list_artifacts") return "Listing generated artifacts";

  // Default: show tool name with truncated args
  const argStr = typeof args === "string" ? args : JSON.stringify(args);
  const truncArgs = argStr.length > 100 ? argStr.slice(0, 100) + "…" : argStr;
  return `Calling ${toolName}(${truncArgs})`;
}

function summarizeToolComplete(toolName: string, data: Record<string, unknown>): string {
  const parsed = parseResultContent(data);

  if (toolName === "web-research-search") {
    const items = Array.isArray(parsed) ? parsed : (parsed.results as unknown[]) ?? [];
    const count = items.length || "several";
    const query = (parsed.query as string) ?? "";
    return query ? `Found ${count} search results for "${query}"` : `Found ${count} search results`;
  }
  if (toolName === "web-research-open_page") {
    const title = (parsed.title as string) ?? (parsed.url as string) ?? "";
    const display = title.length > 80 ? title.slice(0, 80) + "…" : title;
    return display ? `Opened page: ${display}` : "Opened page";
  }
  if (toolName === "vdr-search_documents") {
    const items = Array.isArray(parsed) ? parsed : (parsed.results as unknown[]) ?? (parsed.documents as unknown[]) ?? [];
    return `Found ${items.length || "several"} VDR documents`;
  }
  if (toolName === "vdr-open_document") {
    const title = (parsed.title as string) ?? (parsed.name as string) ?? "";
    const display = title.length > 80 ? title.slice(0, 80) + "…" : title;
    return display ? `Opened document: ${display}` : "Opened document";
  }
  if (toolName === "finance-load_kpis") return "Loaded KPI data";
  if (toolName === "finance-compute_cohorts") return "Computed cohort analysis";
  if (toolName === "finance-revenue_bridge") return "Generated revenue bridge";
  if (toolName === "workflow-create_issue") {
    const title = (parsed.title as string) ?? "";
    return title ? `Created issue: ${title}` : "Created issue";
  }
  if (toolName === "workflow-draft_seller_question") return "Drafted seller question";
  if (toolName === "workflow-list_issues") {
    const items = Array.isArray(parsed) ? parsed : (parsed.issues as unknown[]) ?? [];
    return `Listed ${items.length || "several"} issues`;
  }
  if (toolName === "memo-write_section") {
    const section = (parsed.section as Record<string, unknown>) ?? {};
    const name = (section.name as string) ?? (parsed.sectionName as string) ?? "";
    return name ? `Updated memo section: ${name}` : "Updated memo section";
  }
  if (toolName === "memo-read_section") {
    const section = (parsed.section as Record<string, unknown>) ?? {};
    const name = (section.name as string) ?? (parsed.sectionName as string) ?? "";
    return name ? `Read memo section: ${name}` : "Read memo section";
  }
  if (toolName === "memo-read_full_memo") return "Read full memo";

  if (toolName === "artifacts-generate_memo_pdf") return "Generated memo PDF";
  if (toolName === "artifacts-generate_deck") return "Generated summary deck";
  if (toolName === "artifacts-generate_dashboard") return "Generated interactive dashboard";
  if (toolName === "artifacts-list_artifacts") {
    const items = Array.isArray(parsed) ? parsed : (parsed.artifacts as unknown[]) ?? [];
    return `Listed ${items.length || "several"} artifacts`;
  }

  return `✓ ${toolName} completed`;
}

function extractSummary(sdkType: string, data: Record<string, unknown>): string {
  switch (sdkType) {
    case "assistant.message": {
      const content = (data.content as string) ?? "";
      if (!content || content.length < 5) return ""; // Skip empty tool-call-only messages
      return content.length > 300 ? content.slice(0, 300) + "…" : content;
    }
    case "tool.execution_start": {
      const toolName = (data.toolName as string) ?? (data.name as string) ?? "unknown";
      return summarizeToolStart(toolName, data);
    }
    case "tool.execution_complete": {
      const toolName = (data.toolName as string) ?? (data.name as string) ?? "unknown";
      return summarizeToolComplete(toolName, data);
    }
    case "subagent.started": {
      const agentName = (data.agentName as string) ?? (data.name as string) ?? "unknown";
      return `Delegated to ${agentName}`;
    }
    case "subagent.completed": {
      const agentName = (data.agentName as string) ?? (data.name as string) ?? "unknown";
      return `${agentName} completed`;
    }
    case "permission.requested": {
      const toolName = (data.toolName as string) ?? "action";
      return `Permission requested for ${toolName}`;
    }
    case "permission.completed": {
      const decision = (data.decision as string) ?? (data.result as string) ?? "completed";
      return `Permission ${decision}`;
    }
    case "assistant.turn_start":
      return `Turn ${(data.turnNumber as number) ?? ""} started`;
    case "assistant.turn_end":
      return `Turn completed`;
    case "session.start":
      return "Session started";
    case "session.idle":
      return "Session idle — ready for next message";
    case "session.task_complete": {
      const summary = (data.summary as string) ?? "Task complete";
      return summary.length > 200 ? summary.slice(0, 200) + "…" : summary;
    }
    case "session.error": {
      const msg = (data.message as string) ?? (data.error as string) ?? "Unknown error";
      return `Error: ${msg}`;
    }
    case "user.message":
      return `User: ${(data.content as string)?.slice(0, 150) ?? "message sent"}`;
    default:
      return sdkType;
  }
}

function extractActor(sdkType: string, data: Record<string, unknown>): string {
  if (data.agentName) return data.agentName as string;
  if (data.agent) return data.agent as string;
  if (sdkType.startsWith("tool.")) {
    const toolName = (data.toolName as string) ?? (data.name as string) ?? "tool";
    // Use full tool name for MCP tools (e.g. "web-research.search")
    return toolName;
  }
  if (sdkType.startsWith("subagent.")) return (data.agentName as string) ?? (data.name as string) ?? "sub-agent";
  if (sdkType.startsWith("assistant.")) return "assistant";
  if (sdkType === "user.message") return "user";
  return "orchestrator";
}

// Internal CLI tools that are noise — don't surface in the UI
const INTERNAL_TOOLS = new Set([
  "report_intent", "read_agent", "write_agent", "list_agents",
  "task_complete", "ask_user", "store_memory", "read_memory",
  "view", "glob", "grep", "powershell", "read_powershell",
  "write_powershell", "stop_powershell", "list_powershell",
  "create", "edit", "sql", "fetch_copilot_cli_documentation",
  "ide-get_selection", "ide-get_diagnostics", "skill",
]);

export function createEventBridge(
  runId: string,
  onEvent: HarnessEventCallback
) {
  // Track toolCallId → toolName for pairing start/complete events
  const toolCallNames = new Map<string, string>();

  return function handleStreamEvent(streamEvent: StreamEvent): void {
    const mappedType = MEANINGFUL_EVENTS[streamEvent.type];

    // Skip noisy events that aren't meaningful for the UI
    if (!mappedType) return;

    const data = (streamEvent.data ?? {}) as Record<string, unknown>;
    const toolCallId = data.toolCallId as string | undefined;

    // Track tool names from start events
    if (streamEvent.type === "tool.execution_start" && toolCallId) {
      const toolName = (data.toolName as string) ?? "unknown";
      toolCallNames.set(toolCallId, toolName);
    }

    // Resolve tool name for complete events (they don't carry toolName)
    if (streamEvent.type === "tool.execution_complete" && toolCallId) {
      const resolvedName = toolCallNames.get(toolCallId);
      if (resolvedName) {
        data.toolName = resolvedName;
        toolCallNames.delete(toolCallId);
      }
    }

    // Filter out internal CLI tool calls
    if (streamEvent.type === "tool.execution_start" || streamEvent.type === "tool.execution_complete") {
      const toolName = (data.toolName as string) ?? (data.name as string) ?? "";
      if (INTERNAL_TOOLS.has(toolName)) return;
    }

    const summary = extractSummary(streamEvent.type, data);

    // Skip events with empty summaries (e.g. tool-call-only assistant.message)
    if (!summary) return;

    // Determine the event type — override for specific MCP tool completions
    let eventType = mappedType;
    if (streamEvent.type === "tool.execution_complete") {
      const toolName = (data.toolName as string) ?? "";
      if (toolName.includes("create_issue")) eventType = "issue.created";
      else if (toolName.includes("write_section")) eventType = "memo.updated";
      else if (toolName.includes("draft_seller_question")) eventType = "approval.requested";
      else if (toolName.includes("generate_memo_pdf") || toolName.includes("generate_deck") || toolName.includes("generate_dashboard")) eventType = "artifact.generated";
    }

    const harnessEvent: HarnessEvent = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      runId,
      actorName: extractActor(streamEvent.type, data),
      summary,
      payload: data,
    };

    onEvent(harnessEvent);
  };
}

export function emitHarnessEvent(
  runId: string,
  eventType: HarnessEventType,
  actorName: string,
  summary: string,
  payload: Record<string, unknown>,
  onEvent: HarnessEventCallback
): void {
  const event: HarnessEvent = {
    eventId: uuidv4(),
    eventType,
    timestamp: new Date().toISOString(),
    runId,
    actorName,
    summary,
    payload,
  };
  onEvent(event);
}
