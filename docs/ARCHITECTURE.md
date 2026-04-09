# Architecture

Technical architecture for the Diligence Agentic Harness — an AI-powered M&A due diligence platform built on the GitHub Copilot SDK.

---

## 1. System Overview

The project is a **TypeScript pnpm monorepo** with four packages:

| Package | Path | Purpose |
|---------|------|---------|
| **harness** | `packages/harness/` | Express API server, Copilot SDK integration, orchestrator logic |
| **mcp-servers** | `packages/mcp-servers/` | 6 MCP tool servers (web-research, vdr, finance, workflow, memo, artifacts) |
| **web** | `packages/web/` | Next.js 16 frontend with real-time event streaming |
| **data** | `packages/data/` | Deal datasets — canonical documents, financials, public cache |

**Runtime:** Node.js 18+, Next.js 16 (App Router), Express 4  
**LLM:** Azure AI Foundry (GPT-5.4-mini) via BYOK provider  
**Package Manager:** pnpm 9 with workspace protocol

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (:3001)                  │
│  Landing Page │ Run Timeline │ Intel Panel │ Dashboard Modal │
├─────────────────────────────────────────────────────────────┤
│                    Express API Server (:3000)                │
│   POST /run │ GET /events (SSE) │ GET /artifacts │ /steer   │
├─────────────────────────────────────────────────────────────┤
│              GitHub Copilot SDK (Agent Loop)                 │
│   Session Factory │ Event Bridge │ Hooks │ Skills            │
├──────┬──────┬──────┬──────┬──────┬───────────────────────────┤
│ web- │ vdr  │ fin- │ work │ memo │ artifacts                 │
│ rsrch│      │ ance │ flow │      │                           │
│ MCP  │ MCP  │ MCP  │ MCP  │ MCP  │ MCP                       │
└──────┴──────┴──────┴──────┴──────┴───────────────────────────┘
```

---

## 2. GitHub Copilot SDK Integration

This is the core of the system. The harness uses the `@github/copilot-sdk` package to create an autonomous agent that performs M&A due diligence via a multi-turn tool-use loop.

### 2a. Agent Loop

The SDK manages the full LLM ↔ tool call cycle automatically. The harness configures a session and sends a single user message; the SDK then loops — calling the LLM, executing tools, feeding results back — until the task is complete.

**Key files:**
- `packages/harness/src/client.ts` — `CopilotClient` creation and Azure config
- `packages/harness/src/session-factory.ts` — Session setup with all SDK features wired in

```typescript
// client.ts — Start the SDK client
export async function createCopilotClient(): Promise<CopilotClient> {
  const client = new CopilotClient();
  await client.start();
  return client;
}
```

```typescript
// session-factory.ts — Create a configured session
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
  mcpServers: { /* ... 6 servers ... */ },
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
```

After creation, a single `session.send(userPrompt)` call triggers the entire multi-turn analysis. The SDK fires tool calls, collects results, and loops until the LLM signals completion (`session.idle` / `session.ended`).

### 2b. MCP Servers (Model Context Protocol)

The harness uses **6 local stdio MCP servers**, each running as a separate Node.js process. The SDK launches and manages their lifecycle automatically — no manual process management needed.

Tools are **auto-discovered** from each MCP server's capability declaration. The session config uses `tools: ["*"]` to expose all tools from each server.

```typescript
// session-factory.ts — MCP server configuration
mcpServers: {
  "web-research": {
    type: "stdio",
    command: "node",
    args: [path.join(mcpRoot, "web-research", "server.js")],
    env: { DEAL_ID: workspace.dealId ?? "atlas" },
    tools: ["*"],
  },
  vdr:       { type: "stdio", command: "node", args: [...], env: dealEnv, tools: ["*"] },
  finance:   { type: "stdio", command: "node", args: [...], env: dealEnv, tools: ["*"] },
  workflow:  { type: "stdio", command: "node", args: [...], env: dealEnv, tools: ["*"] },
  memo:      { type: "stdio", command: "node", args: [...], env: dealEnv, tools: ["*"] },
  artifacts: { type: "stdio", command: "node", args: [...], env: { DEAL_ID: ..., ARTIFACTS_DIR: ... }, tools: ["*"] },
},
```

**Server inventory:**

| Server | Tools | Purpose |
|--------|-------|---------|
| `web-research` | `search`, `open_page` | Public web research (market data, news, competitors) |
| `vdr` | `search_documents`, `open_document` | Virtual data room — private deal documents |
| `finance` | `load_kpis`, `compute_cohorts`, `revenue_bridge` | Financial analysis and KPI computation |
| `workflow` | `create_issue`, `draft_seller_question`, `list_issues` | Issue tracking and seller Q&A workflow |
| `memo` | `write_section`, `read_section`, `read_full_memo` | Investment memo authoring (in-memory per session) |
| `artifacts` | `generate_memo_pdf`, `generate_deck`, `generate_dashboard`, `list_artifacts` | PDF/PPTX/JSON artifact generation |

### 2c. Skills (SKILL.md Prompt Modules)

The SDK's skill system injects domain expertise into the LLM context without code changes. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and markdown instructions.

**Skill directory:** `packages/harness/src/skills/`

```typescript
// session-factory.ts — Skills are loaded from a directory
skillDirectories: [skillsDir],
```

**9 skills across three categories:**

| Category | Skill | Purpose |
|----------|-------|---------|
| **Methodology** | `diligence-methodology` | Structured diligence framework and phase guidance |
| | `evidence-rules` | Evidence classification, provenance tagging rules |
| **Analysis** | `commercial-analysis` | Market sizing, competitive landscape, GTM assessment |
| | `financial-analysis` | Revenue quality, unit economics, cohort analysis |
| | `legal-analysis` | Contract risk, IP, regulatory compliance |
| | `contradiction-detection` | Cross-referencing public claims vs private data |
| **Output** | `memo-format` | IC-quality memo structure and writing standards |
| | `deck-format` | Presentation slide structure and content density rules |
| | `dashboard-insights` | Dashboard KPI selection and status classification |

Each `SKILL.md` follows this structure:

```markdown
---
name: memo-format
description: Investment memo structure and IC-quality writing standards
---

# Memo Format Standards

## Section Requirements
- Executive Summary: 3-4 paragraphs, opportunity + thesis + risks + recommendation
- Commercial: 6+ paragraphs with sub-headings, quantified analysis
...
```

Skills are version-controlled alongside the codebase, making domain expertise modular and reviewable.

### 2d. Hooks

The SDK provides lifecycle hooks that the harness uses for approval gating, provenance tagging, context injection, and error handling.

#### `onPreToolUse` — Approval Gate

Implements a tier-based permission model. Each tool has an assigned tier; tier-2 tools (e.g., `draft_seller_question`) require human approval before execution.

```typescript
// hooks/approval-gate.ts
export function createApprovalGateHook(onApprovalNeeded?: ApprovalCallback) {
  return function onPreToolUse(input, _invocation): PreToolUseHookOutput {
    const tier = getToolTier(input.toolName);
    switch (tier) {
      case 0: return { permissionDecision: "allow" };
      case 1: return { permissionDecision: "allow" }; // logged
      case 2: {
        // Queue approval request, deny until human approves
        if (onApprovalNeeded) onApprovalNeeded({ toolName, input: toolArgs, tier, timestamp });
        return {
          permissionDecision: "deny",
          permissionDecisionReason: "Requires human approval. An approval request has been queued.",
        };
      }
    }
  };
}
```

#### `onPostToolUse` — Provenance Tagger

Labels every tool result with source metadata so the LLM and downstream consumers know the provenance of each piece of evidence.

```typescript
// hooks/provenance-tagger.ts
const SERVER_PROVENANCE_MAP: Record<string, ProvenanceType> = {
  "web-research": "public_live",
  vdr:            "synthetic_private",
  finance:        "synthetic_private",
  workflow:       "derived",
  memo:           "derived",
};

// Returns { additionalContext: JSON.stringify({ provenance: { provenanceType, sourceName, taggedAt } }) }
```

#### `onSessionStart` — Workspace Injection

Loads deal context (code name, status, stage, existing evidence count, open issues, memo state) into the session as `additionalContext`, giving the LLM awareness of the current workspace.

#### `onSessionEnd` — Cleanup

Logs session completion with reason (`complete`, `error`, `abort`, `timeout`, `user_exit`) and returns a session summary.

#### `onErrorOccurred` — Structured Error Handling

Categorizes errors and returns appropriate handling strategies:

```typescript
// hooks/error-handler.ts
// MCP server failures → retry (up to 2 attempts)
// Recoverable errors  → skip
// Fatal errors         → abort
```

### 2e. Streaming Events

The SDK emits **20+ event types** during execution. The harness uses an **Event Bridge** pattern (`events/bridge.ts`) to filter and map these to a smaller set of domain-meaningful events.

**SDK → Harness event mapping:**

| SDK Event | Harness Event |
|-----------|---------------|
| `tool.execution_start` | `tool.invoked` |
| `tool.execution_complete` | `tool.completed` (or `issue.created`, `memo.updated`, `artifact.generated`) |
| `session.start` | `session.started` |
| `session.idle` | `session.ended` |
| `session.task_complete` | `run.completed` |
| `session.error` | `error.occurred` |
| `user.message` | `steer.received` |
| `assistant.message` | `agent.responded` |

The bridge also performs **`toolCallId` tracking** — tool completion events from the SDK don't carry the tool name, so the bridge maintains a `Map<toolCallId, toolName>` to pair start/complete events:

```typescript
// events/bridge.ts — toolCallId tracking
const toolCallNames = new Map<string, string>();

// On tool.execution_start: toolCallNames.set(toolCallId, toolName)
// On tool.execution_complete: toolName = toolCallNames.get(toolCallId)
```

Internal CLI tools (e.g., `view`, `grep`, `powershell`) are filtered out via an `INTERNAL_TOOLS` set so only MCP tool calls appear in the UI.

**Harness event types** (`events/types.ts`):

```typescript
export type HarnessEventType =
  | "run.started" | "run.completed" | "run.failed"
  | "agent.delegated" | "agent.responded"
  | "tool.invoked" | "tool.completed" | "tool.failed"
  | "evidence.collected" | "claim.evaluated" | "contradiction.detected"
  | "issue.created" | "issue.resolved"
  | "memo.updated"
  | "approval.requested" | "approval.granted" | "approval.denied"
  | "session.started" | "session.ended"
  | "steer.received" | "steer.sent" | "message.queued"
  | "artifact.generated"
  | "error.occurred";
```

### 2f. Session Persistence

Sessions use structured IDs for traceability:

```
deal-{dealId}-run-{timestamp}
```

A **SQLite database** stores session metadata and all events, enabling replay and audit:

```sql
-- db/sqlite-store.ts
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  run_id TEXT UNIQUE NOT NULL,
  deal_id TEXT NOT NULL,
  code_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  prompt TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_name TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL DEFAULT '{}',
  timestamp TEXT NOT NULL
);
```

The `SessionStore` interface (`db/types.ts`) is pluggable — the factory function selects the implementation based on `SESSION_STORE_TYPE`:

```typescript
// db/index.ts
export function createSessionStore(config?): SessionStore {
  const storeType = config?.type ?? process.env.SESSION_STORE_TYPE ?? "sqlite";
  if (storeType === "sqlite") {
    return new SqliteSessionStore(dbPath);
  }
  // Future: "cosmos", "azure-sql"
}
```

Sessions survive server restarts via the persistent SQLite database (WAL mode for concurrent reads).

### 2g. BYOK Provider

The SDK connects to Azure AI Foundry using the Bring Your Own Key (BYOK) provider model:

```typescript
provider: {
  type: "openai",
  baseUrl: harnessConfig.azureEndpoint,   // Azure AI Foundry endpoint
  wireApi: "responses",                    // GPT-5 series wire format
  bearerToken: harnessConfig.bearerToken,  // Azure AD token (preferred)
  // OR: apiKey: harnessConfig.apiKey      // API key fallback
},
```

- **Type:** `"openai"` with `wireApi: "responses"` for GPT-5 series models
- **Auth (preferred):** `bearerToken` via Azure AD — NOT API key
- **Token audience:** `https://ai.azure.com`
- **Token acquisition:** `az account get-access-token --resource "https://ai.azure.com"`

```typescript
// client.ts — Azure AD token acquisition
function getAzureAdToken(): string {
  const resource = process.env.AZURE_TOKEN_RESOURCE ?? "https://ai.azure.com";
  const token = execSync(
    `az account get-access-token --resource "${resource}" --query "accessToken" -o tsv`,
    { encoding: "utf-8", timeout: 15000 }
  ).trim();
  return token;
}
```

Auth mode is controlled by `AZURE_AUTH_MODE` (`"azure-ad"` default, `"api-key"` fallback).

---

## 3. Orchestrator Design

The harness uses a **single orchestrator pattern** — one agent performs all analysis directly, with no sub-agent delegation. This is a deliberate design choice: sub-agent tool calls are invisible in the parent's event stream, which would break the real-time UI and audit trail.

### 5-Phase Workflow

The orchestrator's behavior is encoded in a ~158-line system prompt (`agents/orchestrator-prompt.ts`):

| Phase | Activity | Key Tools |
|-------|----------|-----------|
| **1. Public Research** | Market research, competitor analysis, news | `web-research-search`, `web-research-open_page` |
| **2. Private Data Review** | VDR documents, financial analysis | `vdr-*`, `finance-*` |
| **3. Analysis & Issues** | Contradiction detection, issue creation | `workflow-create_issue`, `workflow-draft_seller_question` |
| **4. Memo Drafting** | 6 IC-quality memo sections | `memo-write_section`, `memo-read_full_memo` |
| **5. Artifact Generation** | PDF memo, PPTX deck, dashboard JSON | `artifacts-generate_*` |

### Completion Checklist

The system prompt enforces a completion checklist before the session can end:
1. **5+ issues** created via `workflow-create_issue`
2. **6 memo sections** written (Executive Summary, Commercial, Financial, Legal, Open Issues, Recommendation)
3. **3 artifacts** generated (memo PDF, summary deck, dashboard data)
4. Verification via `memo-read_full_memo` and `artifacts-list_artifacts`
5. Final summary with issue count and confidence assessment

The system prompt explicitly lists every tool with its parameter schema, preventing hallucinated tool names or incorrect argument shapes.

---

## 4. Event Data Flow

```
SDK SessionEvent → Event Bridge (filter/map) → HarnessEvent → SSE → Frontend
                                                    ↓
                                              SessionStore (SQLite)
                                                    ↓
                                              ArtifactStore (local/blob)
```

### Detailed Flow

1. **SDK emits** a `SessionEvent` (e.g., `tool.execution_start`) during the agent loop
2. **Event Bridge** (`events/bridge.ts`) receives the raw event:
   - Checks against `MEANINGFUL_EVENTS` map — drops noisy events not in the map
   - Tracks `toolCallId → toolName` for pairing start/complete events
   - Filters out `INTERNAL_TOOLS` (CLI tools like `view`, `grep`)
   - Extracts human-readable summary via `extractSummary()`
   - Overrides event type for domain-specific completions (e.g., `tool.completed` → `issue.created`)
   - Emits a `HarnessEvent` with UUID, timestamp, actor, summary, and raw payload
3. **Express server** receives the `HarnessEvent`:
   - Persists to `SessionStore` (SQLite by default)
   - Pushes to all connected SSE clients for the run
4. **Frontend** (`useEventStream` hook) receives events via SSE:
   - `useRunState` derives all UI state from the event stream via `useMemo`
   - Memo content, issues, evidence, artifacts — all extracted from event payloads

### Tool Result Nesting

Tool results from MCP servers are double-encoded. The event payload structure is:

```
event.payload.result.content → JSON string → parsed object
```

The bridge's `parseResultContent()` handles this unwrapping for summary generation.

---

## 5. MCP Server Design

Each MCP server is a standalone Node.js process built with `@modelcontextprotocol/sdk`.

**Key files:**
- `packages/mcp-servers/src/shared/mcp-helpers.ts` — shared `createMcpServer()` + `startStdioServer()` helpers
- `packages/mcp-servers/src/{server}/server.ts` — individual server implementations

### Shared Pattern

```typescript
// shared/mcp-helpers.ts
export function createMcpServer(name: string, version: string): McpServer {
  return new McpServer({ name, version });
}
```

Each server follows the same structure:
1. Create server via `createMcpServer()`
2. Register tools with Zod schemas for input validation
3. Read `DEAL_ID` from environment to select deal-specific data
4. Start stdio transport via `startStdioServer()`

### Deal Datasets

The system ships with 3 synthetic deal datasets in `packages/data/`:

| Code Name | Sector | Description |
|-----------|--------|-------------|
| **Atlas** | Supply Chain SaaS | Default dataset — supply chain management platform |
| **Titan** | Cybersecurity | Enterprise security platform |
| **Meridian** | Healthcare | Healthcare technology company |

Each server reads `DEAL_ID` from its environment and loads the corresponding dataset. The `artifacts` server additionally receives `ARTIFACTS_DIR` to control where generated files are written.

### State Model

Most servers are **stateless per invocation** — each tool call reads from the data package and returns results. Two exceptions maintain in-memory state within a session:
- **memo**: Accumulates written sections in memory so `read_full_memo` can assemble the complete document
- **workflow**: Maintains the issue list in memory so `list_issues` returns all issues created during the session

---

## 6. Artifact Generation Pipeline

Phase 5 of the orchestrator generates three artifacts after the memo is complete.

### Memo PDF

- **Library:** PDFKit
- **Flow:** Markdown → structured PDF with cover page, section headers, body text, and tables
- **Tool:** `artifacts-generate_memo_pdf` — accepts `{ title, markdown }`
- **Output:** `memo.pdf` written to `ARTIFACTS_DIR`

### Summary Deck

- **Library:** PptxGenJS
- **Flow:** Structured slide data → PPTX with KPI boxes, issues tables, two-column layouts, and slide masters
- **Tool:** `artifacts-generate_deck` — accepts `{ title, slides: [{ title, content }] }`
- **Output:** `deck.pptx` written to `ARTIFACTS_DIR`
- Slides include specific metrics, not vague summaries — the system prompt enforces data density

### Dashboard Data

- **Format:** JSON data structure consumed by the Next.js dashboard route
- **Tool:** `artifacts-generate_dashboard` — accepts `{ title, kpis, revenueBreakdown, issuesSummary, concentrationData }`
- **Output:** `dashboard.json` written to `ARTIFACTS_DIR`
- **Rendering:** `packages/web/app/dashboard/[runId]/page.tsx` renders a rich Tailwind CSS dashboard

### Storage Abstraction

Artifacts are stored via the `ArtifactStore` interface, with two implementations:

```typescript
// storage/index.ts
export function createArtifactStore(config?): ArtifactStore {
  const storeType = config?.type ?? process.env.ARTIFACT_STORE_TYPE ?? "local";

  if (storeType === "local") {
    return new LocalArtifactStore(config?.path);    // → artifacts/{runId}/
  }
  if (storeType === "azure-blob") {
    return new BlobArtifactStore(connStr, container); // → Azure Blob Storage
  }
}
```

| Implementation | Storage | Config |
|---------------|---------|--------|
| `LocalArtifactStore` | `artifacts/{runId}/` on filesystem | `ARTIFACT_STORE_PATH` |
| `BlobArtifactStore` | Azure Blob Storage container | `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER` |

Artifact files are written by the MCP server process. The server returns metadata (filename, type, size) to the SDK — the actual file content never passes through the LLM, avoiding large payload truncation.

---

## 7. Frontend Architecture

**Framework:** Next.js 16 (App Router) with React 19 and Tailwind CSS

### Route Structure

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `page.tsx` | Landing page + active run view (single-page app pattern) |
| `/dashboard/[runId]` | `dashboard/[runId]/page.tsx` | Full-page dashboard for a completed run |

URL hash tracks the active session for deep linking.

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `Sidebar` | `components/Sidebar.tsx` | Session history, deal selector, new run controls |
| `RunTimeline` | `components/RunTimeline.tsx` | Chronological event stream with phase grouping |
| `IntelPanel` | `components/IntelPanel.tsx` | 7-tab panel (Memo, Issues, Evidence, Skills, Tools, Trace, Export) |
| `DashboardModal` | `components/DashboardModal.tsx` | Modal overlay rendering dashboard data |
| `ArtifactViewer` | `components/ArtifactViewer.tsx` | PDF/PPTX/dashboard artifact preview and download |
| `MemoViewer` | `components/MemoViewer.tsx` | Rendered memo with section navigation |
| `IssueBoard` | `components/IssueBoard.tsx` | Issue tracker with severity filtering |
| `TimelineEvent` | `components/TimelineEvent.tsx` | Individual event card in the timeline |
| `SessionControls` | `components/SessionControls.tsx` | Steer/queue/approve interaction controls |

### Real-Time State Management

The frontend is fully event-driven. Two custom hooks handle all data flow:

**`useEventStream`** (`hooks/useEventStream.ts`)
- Connects to `GET /api/run/{runId}/events` via SSE (Server-Sent Events)
- Accumulates events into an array
- Reconnects on disconnection

**`useRunState`** (`hooks/useRunState.ts`)
- Derives all UI state from the event array via `useMemo`
- Extracts memo sections from `memo.updated` events
- Extracts issues from `issue.created` events
- Extracts evidence from tool completion payloads
- Tracks run status, phase, artifact availability
- No separate API calls for state — everything comes from the event stream

### API Client

`lib/api-client.ts` wraps the harness API:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/deals` | GET | Available deal datasets |
| `/api/run` | POST | Start a new diligence run |
| `/api/run/:runId/events` | GET (SSE) | Real-time event stream |
| `/api/run/:runId/steer` | POST | Send steering message to active session |
| `/api/run/:runId/queue` | POST | Queue a follow-up message |
| `/api/run/:runId/approve` | POST | Approve a tier-2 tool request |
| `/api/run/:runId/artifacts` | GET | List generated artifacts |
| `/api/run/:runId/dashboard-data` | GET | Dashboard JSON for rendering |

---

## 8. Storage & Deployment

### Local Development

| Concern | Implementation | Config |
|---------|---------------|--------|
| Sessions | SQLite (WAL mode) | `SESSION_DB_PATH` (default: `./diligence-sessions.db`) |
| Artifacts | Local filesystem | `ARTIFACT_STORE_PATH` (default: `./artifacts/`) |
| LLM | Azure AI Foundry | `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` |

### Azure Deployment

| Concern | Implementation | Config |
|---------|---------------|--------|
| Sessions | Azure SQL / Cosmos DB | `SESSION_STORE_TYPE=azure-sql` |
| Artifacts | Azure Blob Storage | `ARTIFACT_STORE_TYPE=azure-blob`, `AZURE_STORAGE_CONNECTION_STRING` |
| LLM | Azure AI Foundry | Same endpoint, Azure AD auth via managed identity |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | ✅ | Azure AI Foundry endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | — | Model deployment name (default: `gpt-5.4-mini`) |
| `AZURE_OPENAI_MODEL` | — | Model name override |
| `AZURE_AUTH_MODE` | — | `azure-ad` (default) or `api-key` |
| `AZURE_OPENAI_API_KEY` | ✅* | Required if `AZURE_AUTH_MODE=api-key` |
| `AZURE_TOKEN_RESOURCE` | — | Token audience (default: `https://ai.azure.com`) |
| `SESSION_STORE_TYPE` | — | `sqlite` (default) or `azure-sql` |
| `SESSION_DB_PATH` | — | SQLite database path |
| `ARTIFACT_STORE_TYPE` | — | `local` (default) or `azure-blob` |
| `ARTIFACT_STORE_PATH` | — | Local artifact directory |
| `AZURE_STORAGE_CONNECTION_STRING` | ✅* | Required if `ARTIFACT_STORE_TYPE=azure-blob` |
| `AZURE_STORAGE_CONTAINER` | — | Blob container name (default: `diligence-artifacts`) |
| `PORT` | — | Express server port (default: `3000`) |
| `DEAL_ID` | — | Default deal dataset (default: `atlas`) |
| `LOG_LEVEL` | — | Logging verbosity |

Environment variables control all backend switching — **no code changes needed** to deploy from local to Azure.

---

## 9. Key Technical Decisions

### 1. Single Orchestrator over Sub-Agents

Sub-agent tool calls are invisible in the parent's event stream. Since the entire UI and audit trail depends on observing every tool call, a single orchestrator that calls all tools directly ensures full visibility.

### 2. MCP Servers over In-Process Tools

Each tool server runs as a separate Node.js process, providing:
- **Process isolation** — a crashing tool server doesn't take down the harness
- **SDK lifecycle management** — the SDK handles launch, stdio communication, and shutdown
- **Language independence** — servers could be rewritten in any language supporting MCP

### 3. Skills for Domain Knowledge Injection

SKILL.md files inject domain expertise (diligence methodology, writing standards, analysis frameworks) into the LLM context. Benefits:
- **Version-controlled** alongside the codebase
- **Modular** — add or modify expertise without code changes
- **Reviewable** — markdown files are easy to audit and iterate on

### 4. Event Bridge Pattern

The SDK emits 80+ events during a typical run. The bridge filters to ~12 meaningful domain events, preventing UI noise while retaining full audit detail in the session store. Domain-specific event type overrides (e.g., `tool.completed` → `issue.created`) enable the frontend to render specialized UI for different tool outcomes.

### 5. Storage Abstractions for Cloud Portability

Both `SessionStore` and `ArtifactStore` use interface-based abstractions with factory functions. Adding a new storage backend (e.g., Cosmos DB, S3) requires only:
1. Implement the interface
2. Add a case to the factory function
3. Set an environment variable

### 6. Artifact Files Written by MCP Server

The artifacts MCP server writes files directly to disk (or blob storage). Only metadata (filename, type, size) is returned to the SDK. This avoids passing large binary content (PDFs, PPTX files) through the LLM response, which would be truncated or exceed token limits.
