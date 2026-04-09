# Acceptance Audit

Status key:
- [ ] not started
- [~] in progress
- [x] passed
- [!] failed / regressed

## Phase 1 — Monorepo and SDK Foundation
- [x] Root monorepo scaffolded (package.json, pnpm-workspace.yaml, tsconfig.base.json)
- [x] packages/harness created with @github/copilot-sdk dependency
- [x] BYOK Azure OpenAI config implemented (client.ts)
- [x] Agent loop proven with CLI entry point (index.ts)
- [x] packages/data created with synthetic corpus
- [x] All packages typecheck cleanly

## Phase 2 — MCP Servers
- [x] packages/mcp-servers created with @modelcontextprotocol/sdk
- [x] Web-research MCP server (search, open_page)
- [x] VDR MCP server (search_documents, open_document)
- [x] Finance MCP server (load_kpis, compute_cohorts, revenue_bridge)
- [x] Workflow MCP server (create_issue, draft_seller_question, list_issues)
- [x] Memo MCP server (read_section, write_section, read_full_memo)
- [x] MCP servers wired into session config

## Phase 3 — Custom Agents and Skills
- [x] 4 specialist agent configs defined (commercial, financial, legal, synthesis)
- [x] Orchestrator system prompt written
- [x] 4 SKILL.md files created (diligence-methodology, memo-format, evidence-rules, contradiction-detection)
- [x] Agents + skills wired into session factory

## Phase 4 — Hooks and Approval Gates
- [x] Approval gate hook (tier-based onPreToolUse)
- [x] Provenance tagger hook (onPostToolUse)
- [x] Session lifecycle hooks (onSessionStart/End)
- [x] Error handler hook (onErrorOccurred)
- [x] All hooks wired into session factory

## Phase 5 — State and Event Bridge
- [x] Domain types defined with Zod schemas
- [x] In-memory workspace store with upsert semantics
- [x] SDK event → harness event bridge
- [x] Trace store with JSONL persistence
- [x] Session persistence with structured IDs

## Phase 6 — API Server
- [x] Express API server setup
- [x] POST /api/run endpoint
- [x] GET /api/run/:runId/events SSE endpoint
- [x] POST /api/run/:runId/steer endpoint
- [x] POST /api/run/:runId/queue endpoint
- [x] POST /api/run/:runId/approve endpoint
- [x] Session management endpoints

## Phase 7 — Next.js Frontend
- [x] packages/web created (Next.js 15 + React 19)
- [x] Dashboard page (start run, view list)
- [x] Run detail page (split view layout)
- [x] EventStream component (SSE-driven)
- [x] TraceInspector component
- [x] MemoViewer component
- [x] IssueBoard component
- [x] ApprovalDrawer component
- [x] EvidencePanel component
- [x] ToolRegistryView component
- [x] SessionControls component

## Phase 8 — Integration, Testing and Demo Polish
- [x] Unit tests for state store, hooks, tool registry, trace store (43 tests)
- [x] Integration tests for API lifecycle, replay, state lifecycle (33 tests)
- [x] Gold walkthrough definition (walkthrough/gold-scenario.ts)
- [x] Replay mode (replay/replayer.ts + sample-run.ts + replay-server.ts)
- [x] README and documentation
- [x] Acceptance audit tracking

## Test Summary
- **76 tests across 7 files**, all passing
- **3 packages typecheck cleanly** (harness, mcp-servers, web)
