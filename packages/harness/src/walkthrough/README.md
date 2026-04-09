# Gold Walkthrough — Project Atlas

## What is the Gold Walkthrough?

The **gold walkthrough** is a deterministic specification of the expected "happy path" through a first-pass due-diligence run on **Project Atlas** (a vertical SaaS company in construction management).  It does **not** require a live LLM — it is a fixture describing what *should* happen so that tests, demos, and acceptance checks can assert against concrete expectations.

The specification lives in `gold-scenario.ts` and exports:

| Export | Purpose |
|---|---|
| `GOLD_PROMPT` | The exact diligence prompt used to kick off the run |
| `EXPECTED_PLAN` | The `RunPlan` the orchestrator should produce |
| `EXPECTED_AGENT_SEQUENCE` | Ordered list of agent names: commercial → financial → legal → synthesis |
| `EXPECTED_ISSUES` | Four hidden issues the agents should discover (mapped from `hidden_issues.json`) |
| `EXPECTED_MEMO_SECTIONS` | Six IC-memo sections the synthesis agent should write |
| `EXPECTED_TOOL_CALLS` | Per-tool invocation ranges and primary-agent attribution |
| `EXPECTED_APPROVALS` | Tier-2 approval requests the harness should surface |

---

## How to run (once Azure OpenAI is configured)

```bash
# 1. Set required environment variables
export AZURE_OPENAI_ENDPOINT="https://<your-resource>.openai.azure.com"
export AZURE_OPENAI_DEPLOYMENT="<deployment-name>"
export AZURE_OPENAI_API_KEY="<key>"          # or use DefaultAzureCredential

# 2. Build the harness
cd packages/harness
npm run build          # or: npx tsc

# 3. Run the harness with the gold prompt
node dist/index.js "Run first-pass due diligence on Project Atlas, a vertical SaaS company in construction management. Focus on commercial positioning, financial metrics, and legal risk."
```

The harness will stream events to stdout. Compare the output against the gold scenario exports to verify correctness.

---

## What to expect at each stage

### Stage 1 — Plan generation
The orchestrator receives `GOLD_PROMPT` and produces a `RunPlan` with four steps across three parallel workstreams (commercial, financial, legal) plus a dependent synthesis step.

### Stage 2 — Commercial analysis
The **commercial** agent:
- Searches the web for Atlas's public footprint and competitive landscape.
- Reads VDR documents (CIM, customer list, management presentation).
- Discovers **hidden_3**: customer concentration exceeds management framing (top-5 = 29.6% ARR).
- Creates an open issue.

### Stage 3 — Financial analysis
The **financial** agent:
- Extracts KPIs and builds a revenue bridge from VDR financials.
- Analyses retention cohorts and detects anomalies.
- Discovers **hidden_1**: SMB GRR deteriorating (85% → 78%) masked by enterprise NRR.
- Discovers **hidden_4**: revenue-bridge gap ($8M claimed vs $6.2M segment-level).
- Creates open issues for each finding.

### Stage 4 — Legal analysis
The **legal** agent:
- Reviews key contracts in the VDR for change-of-control and assignment clauses.
- Discovers **hidden_2**: BuildCo National ($4.2M ARR) has a CoC termination right.
- Requests approval to draft a seller question via `workflow.draft_seller_question` (Tier 2).
- Creates an open issue.

### Stage 5 — Synthesis & memo
The **synthesis** agent:
- Reads all open issues and evidence from prior workstreams.
- Resolves any cross-workstream contradictions.
- Writes six IC-memo sections: executive-summary, commercial, financial, legal, open-issues, recommendation.

---

## How to verify outputs

### Against `expected_claims.json`
Each claim in `packages/data/canonical/expected_claims.json` has an `expectedStatus` (`supported` or `contradicted`).  After the run:

1. Collect all `Claim` objects from the deal workspace.
2. For each expected claim, find the matching workspace claim by `text` or `workstream`.
3. Assert `claim.status === expectedClaim.expectedStatus`.

| Claim | Expected Status | Workstream |
|---|---|---|
| "Atlas has strong enterprise segment with 125% NRR" | supported | financial |
| "Overall customer retention is stable across segments" | **contradicted** | financial |
| "No single customer exceeds 10% of ARR" | supported | commercial |
| "Customer base is well-diversified" | **contradicted** | commercial |
| "All major contracts are transferable on acquisition" | **contradicted** | legal |
| "Revenue growth is organic and driven by new business" | **contradicted** | financial |

### Against `hidden_issues.json`
Each entry in `packages/data/canonical/hidden_issues.json` should map to an `OpenIssue` in the workspace:

1. Collect all `OpenIssue` objects from the deal workspace.
2. For each hidden issue, verify a matching issue exists with the correct `severity` and `workstream`.
3. Verify the issue description references the core insight (see `EXPECTED_ISSUES[].expectedInsight`).

### Tool-call coverage
Use the trace store (`TraceStore`) to count tool invocations per tool name. Compare against `EXPECTED_TOOL_CALLS` min/max bounds.

### Approval gates
Verify that at least one `approval.requested` event was emitted for `workflow.draft_seller_question`, matching `EXPECTED_APPROVALS`.
