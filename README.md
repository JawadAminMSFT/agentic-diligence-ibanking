# Agentic Diligence — AI-First Buy-Side M&A Due Diligence

## Overview

An AI-first buy-side due diligence platform that autonomously performs first-pass M&A analysis. Powered by the GitHub Copilot SDK, it orchestrates specialist tools across public research, private data rooms, financial analysis, and legal review — producing IC-quality deliverables in minutes.

## Key Features

- **Autonomous Diligence Agent** — Single orchestrator drives 5-phase analysis workflow using 17 MCP tools
- **Multi-Deal Pipeline** — Run diligence on multiple targets simultaneously (Atlas, Titan, Meridian)
- **IC-Quality Deliverables** — Generates investment memo (PDF), summary deck (PPTX), and interactive dashboard
- **Real-Time Observability** — Watch every tool call, finding, and decision in a live event stream
- **Evidence-Based Analysis** — Every claim traces to a source with provenance labels and confidence scores
- **Contradiction Detection** — Automatically flags discrepancies between management claims and actual data
- **Human-in-the-Loop** — Approval gates for sensitive actions (seller questions), steering for mid-run guidance
- **Session Persistence** — SQLite locally, pluggable for Azure SQL in production
- **Artifact Storage** — Local filesystem or Azure Blob Storage

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (:3001)                    │
│  Pipeline │ Timeline │ Intel Panel │ Dashboard Modal     │
├─────────────────────────────────────────────────────────┤
│              Express API Server (:3000)                  │
│   /run │ /events (SSE) │ /artifacts │ /steer │ /deals   │
├─────────────────────────────────────────────────────────┤
│          GitHub Copilot SDK (Agent Loop)                 │
│   Orchestrator │ Hooks │ Skills │ Event Bridge           │
├──────┬──────┬──────┬──────┬──────┬──────────────────────┤
│ Web  │ VDR  │ Fin  │ Work │ Memo │ Artifacts            │
│ Rsrch│      │ ance │ flow │      │                      │
│ MCP  │ MCP  │ MCP  │ MCP  │ MCP  │ MCP                  │
└──────┴──────┴──────┴──────┴──────┴──────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Agent Runtime | GitHub Copilot SDK (`@github/copilot-sdk`) |
| LLM | Azure AI Foundry (GPT-5.4-mini) |
| MCP Servers | `@modelcontextprotocol/sdk` (6 stdio servers, 17 tools) |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| API Server | Express with SSE streaming |
| Artifact Gen | PDFKit (memo), PptxGenJS (deck), Next.js (dashboard) |
| Session Store | SQLite (local) / Azure SQL (production) |
| Artifact Store | Filesystem (local) / Azure Blob Storage (production) |

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 9+
- GitHub Copilot CLI installed and authenticated
- Azure AI Foundry endpoint (or compatible OpenAI API)

### Setup

```bash
# Clone the repo
git clone https://github.com/jawadaminmsft/agentic-diligence-ibanking.git
cd agentic-diligence-ibanking

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your Azure AI Foundry endpoint and auth

# Build all packages
pnpm --filter mcp-servers build
pnpm --filter harness build

# Start the API server
npx tsx packages/harness/src/serve.ts

# In another terminal, start the frontend
cd packages/web && npx next dev --port 3001
```

### Run Diligence

1. Open http://localhost:3001
2. Select a deal from the pipeline (Atlas, Titan, or Meridian)
3. Click "Run Diligence" — the agent starts autonomous analysis
4. Watch real-time events in the timeline
5. Review memo, issues, and evidence in the Intelligence panel
6. View generated artifacts (PDF memo, PPTX deck, interactive dashboard)

## Copilot SDK Features Used

- **Agent Loop** — Multi-turn LLM ↔ tool call orchestration
- **MCP Servers** — 6 domain-specific tool servers with 17 tools
- **Skills** — 9 SKILL.md prompt modules for domain expertise injection
- **Hooks** — Pre/post tool-use hooks for approval gates and provenance tagging
- **Streaming Events** — Real-time event bridge from SDK to frontend via SSE
- **Session Persistence** — Structured session IDs with SQLite/Azure SQL storage
- **BYOK Provider** — Azure AI Foundry with Azure AD token authentication

## Project Structure

```
packages/
├── harness/          # Core runtime — Copilot SDK integration
│   ├── src/agents/   # Orchestrator prompt
│   ├── src/hooks/    # Approval gate, provenance tagger, lifecycle
│   ├── src/skills/   # 9 SKILL.md domain expertise modules
│   ├── src/events/   # Event bridge, types, trace store
│   ├── src/db/       # Session persistence (SQLite/Azure SQL)
│   ├── src/storage/  # Artifact storage (local/Azure Blob)
│   └── src/server.ts # Express API server
├── mcp-servers/      # 6 MCP tool servers
│   ├── src/web-research/  # Public source search
│   ├── src/vdr/           # Virtual data room
│   ├── src/finance/       # Financial analysis
│   ├── src/workflow/      # Issue tracking
│   ├── src/memo/          # Memo section management
│   └── src/artifacts/     # PDF, PPTX, dashboard generation
├── web/              # Next.js operator UI
│   ├── app/          # Pages (landing, dashboard)
│   ├── components/   # UI components
│   └── hooks/        # Event stream, run state
└── data/             # Synthetic deal corpus (not committed)
```

## Documentation

- [Business Use Cases](docs/BUSINESS.md) — Target users, workflow, value proposition
- [Technical Architecture](docs/ARCHITECTURE.md) — System design, SDK integration, data flows

## License

Internal use only.
