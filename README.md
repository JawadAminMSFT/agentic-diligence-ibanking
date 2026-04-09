# Diligence Agentic Harness

A production-grade agentic harness for M&A due diligence, powered by the [GitHub Copilot SDK](https://github.com/github/copilot-sdk). Orchestrates specialist AI agents to gather evidence, detect contradictions, draft investment memos, and enforce human approval gates — with full runtime observability.

## Architecture

```
packages/
├── harness/        # Core agentic runtime (Copilot SDK, hooks, agents, API server)
├── mcp-servers/    # 5 local MCP servers (web-research, VDR, finance, workflow, memo)
├── web/            # Next.js 15 operator UI (event streaming, trace inspector, approval flow)
└── data/           # Synthetic deal corpus for "Project Atlas"
```

## Copilot SDK Features Used

| Feature | Usage |
|---------|-------|
| **Agent Loop** | Multi-turn tool-use orchestration with `session.idle` completion signals |
| **Custom Agents** | 4 specialist sub-agents (commercial, financial, legal, synthesis) with scoped tools |
| **Hooks** | Approval gates (`onPreToolUse`), provenance tagging (`onPostToolUse`), lifecycle management |
| **MCP Servers** | 5 local stdio servers providing domain-specific tools |
| **Skills** | SKILL.md prompt modules for diligence methodology, memo format, evidence rules |
| **Streaming Events** | Real-time event bridge to Next.js frontend via SSE |
| **Steering & Queueing** | Operator can redirect mid-run or queue follow-up tasks |
| **Session Persistence** | Resumable sessions with structured IDs |

## Prerequisites

- **Node.js** 18+
- **pnpm** 9+
- **GitHub Copilot CLI** installed and authenticated (`copilot --version`)
- **Azure OpenAI** endpoint + API key

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Azure OpenAI credentials:
#   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
#   AZURE_OPENAI_API_KEY=your-key
#   AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

### 3. Build all packages

```bash
pnpm build
```

### 4. Run the harness (CLI mode)

```bash
pnpm dev:harness
```

### 5. Run the operator UI

```bash
pnpm dev:web
```

Then open [http://localhost:3001](http://localhost:3001).

## Project Structure

### packages/harness

The core runtime that wires together all Copilot SDK features:

- **`src/client.ts`** — CopilotClient lifecycle with Azure OpenAI BYOK configuration
- **`src/session-factory.ts`** — Central session creation with all SDK features wired (agents, hooks, MCP, skills)
- **`src/hooks/`** — Approval gates, provenance tagging, lifecycle management, error handling
- **`src/agents/`** — 4 specialist agent definitions + orchestrator system prompt
- **`src/skills/`** — SKILL.md prompt modules for domain expertise
- **`src/tools/`** — Tool registry with tier metadata (0=auto, 1=log, 2=approve)
- **`src/state/`** — Domain types (Zod schemas) and in-memory workspace store
- **`src/events/`** — SDK event → harness event bridge + trace persistence
- **`src/server.ts`** — Express API server for the frontend

### packages/mcp-servers

5 local stdio MCP servers backed by synthetic data:

| Server | Tools | Data Source |
|--------|-------|-------------|
| **web-research** | `search`, `open_page` | Public cache (investor relations, news, etc.) |
| **vdr** | `search_documents`, `open_document` | Synthetic private-room documents (CIM, contracts, KPIs) |
| **finance** | `load_kpis`, `compute_cohorts`, `revenue_bridge` | Financial metrics with segment breakdowns |
| **workflow** | `create_issue`, `draft_seller_question`, `list_issues` | Issue tracking + approval workflow |
| **memo** | `read_section`, `write_section`, `read_full_memo` | Investment memo management |

### packages/web

Next.js 15 operator UI with:

- **Dashboard** — Start new runs, view active sessions
- **Event Stream** — Real-time SSE event feed with filtering
- **Trace Inspector** — Turn-by-turn agent trace with tool call details
- **Memo Viewer** — Investment memo with evidence links and confidence scores
- **Issue Board** — Severity-coded open issues by workstream
- **Approval Drawer** — Approve/reject tier-2 actions (seller questions)
- **Evidence Panel** — Evidence detail with provenance labels
- **Session Controls** — Steer, queue, pause, resume

### packages/data

Synthetic deal corpus for "Project Atlas" (SaaS construction management company):

- **canonical/** — Ground truth, hidden issues, expected claims, peer set
- **artifacts/** — VDR document manifest
- **public_cache/** — Cached public web sources
- **interactions/** — Mocked communications

## Deal Flow

The harness simulates a realistic M&A diligence workflow:

1. **Intake** — Operator starts a run with a diligence prompt
2. **Planning** — Orchestrator creates an explicit plan with workstreams
3. **Public Research** — Web-research agent gathers live public context
4. **Private Room Review** — VDR agent inspects uploaded deal documents
5. **Specialist Analysis** — Commercial, financial, and legal agents run in parallel
6. **Contradiction Detection** — Synthesis agent reconciles public vs. private findings
7. **Issue Surfacing** — Open issues are created with evidence links
8. **Approval Gates** — Seller-facing questions require human approval
9. **Memo Draft** — Investment memo sections are updated incrementally

## Tool Approval Tiers

| Tier | Behavior | Examples |
|------|----------|---------|
| **0** | Auto-approved | `search`, `open_page`, `load_kpis` |
| **1** | Log and proceed | `create_issue`, `write_section` |
| **2** | Require human approval | `draft_seller_question` |

## License

Private — internal use only.
