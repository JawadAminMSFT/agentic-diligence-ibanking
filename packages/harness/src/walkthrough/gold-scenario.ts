/**
 * Gold Walkthrough Scenario — Project Atlas
 *
 * Deterministic specification of the expected "happy path" through a
 * first-pass due-diligence run.  No live LLM required — this file is a
 * fixture that tests and demos can assert against.
 */

import type { RunPlan, OpenIssue, Workstream, Severity } from "../state/types.js";

// ---------------------------------------------------------------------------
// 1. Initial prompt
// ---------------------------------------------------------------------------

export const GOLD_PROMPT =
  "Run first-pass due diligence on Project Atlas, a vertical SaaS company " +
  "in construction management. Focus on commercial positioning, financial " +
  "metrics, and legal risk.";

// ---------------------------------------------------------------------------
// 2. Expected RunPlan the orchestrator should produce
// ---------------------------------------------------------------------------

export const EXPECTED_PLAN: RunPlan = {
  objective:
    "First-pass due diligence on Project Atlas (vertical SaaS — construction management). " +
    "Validate commercial positioning, extract and stress-test financial metrics, " +
    "and surface legal risks from VDR materials.",
  workstreams: ["commercial", "financial", "legal", "synthesis"],
  steps: [
    {
      stepId: "step-1",
      description:
        "Research Atlas's public presence, market positioning, and competitive landscape.",
      agent: "commercial",
      dependsOn: [],
    },
    {
      stepId: "step-2",
      description:
        "Extract KPIs, build revenue bridge, and analyse retention cohorts from VDR financials.",
      agent: "financial",
      dependsOn: [],
    },
    {
      stepId: "step-3",
      description:
        "Review key contracts for change-of-control, assignment, and termination provisions.",
      agent: "legal",
      dependsOn: [],
    },
    {
      stepId: "step-4",
      description:
        "Aggregate findings, resolve contradictions, and draft the IC memo.",
      agent: "synthesis",
      dependsOn: ["step-1", "step-2", "step-3"],
    },
  ],
  knownUnknowns: [
    "Actual churn reason breakdown (not available in data package)",
    "Pending litigation details (if any)",
    "Product roadmap and R&D cost allocation",
  ],
  approvalCheckpoints: ["workflow.draft_seller_question"],
};

// ---------------------------------------------------------------------------
// 3. Expected agent execution order
// ---------------------------------------------------------------------------

export const EXPECTED_AGENT_SEQUENCE: string[] = [
  "commercial",
  "financial",
  "legal",
  "synthesis",
];

// ---------------------------------------------------------------------------
// 4. Expected issues (mapped from hidden_issues.json)
// ---------------------------------------------------------------------------

export interface ExpectedIssue {
  hiddenIssueId: string;
  title: string;
  severity: Severity;
  workstream: Workstream;
  /** Short rationale the agent should surface */
  expectedInsight: string;
}

export const EXPECTED_ISSUES: ExpectedIssue[] = [
  {
    hiddenIssueId: "hidden_1",
    title: "SMB segment gross revenue retention is deteriorating",
    severity: "high",
    workstream: "financial",
    expectedInsight:
      "GRR for SMB dropped from 85% to 78% over 4 quarters; headline NRR of 112% masks the decline via enterprise expansion.",
  },
  {
    hiddenIssueId: "hidden_2",
    title: "Top customer has change-of-control termination right",
    severity: "high",
    workstream: "legal",
    expectedInsight:
      "BuildCo National ($4.2M ARR, 8.75% of total) can terminate on acquisition. Not disclosed in CIM.",
  },
  {
    hiddenIssueId: "hidden_3",
    title: "Customer concentration exceeds management framing",
    severity: "medium",
    workstream: "commercial",
    expectedInsight:
      "Top 5 customers represent 29.6% of ARR. 'Diversified' framing is misleading despite no single customer >10%.",
  },
  {
    hiddenIssueId: "hidden_4",
    title: "Revenue bridge does not reconcile with segment data",
    severity: "medium",
    workstream: "financial",
    expectedInsight:
      "CIM reports $8M new business but segment-level new customer data totals $6.2M. Possible reclassification of expansion as new.",
  },
];

// ---------------------------------------------------------------------------
// 5. Expected IC memo sections
// ---------------------------------------------------------------------------

export const EXPECTED_MEMO_SECTIONS: string[] = [
  "executive-summary",
  "commercial",
  "financial",
  "legal",
  "open-issues",
  "recommendation",
];

// ---------------------------------------------------------------------------
// 6. Expected tool-call patterns (tool name + approximate expected count)
// ---------------------------------------------------------------------------

export interface ExpectedToolCall {
  toolName: string;
  /** Rough lower bound of invocations */
  minCalls: number;
  /** Rough upper bound of invocations */
  maxCalls: number;
  /** Which agent is the primary caller */
  primaryAgent: string;
}

export const EXPECTED_TOOL_CALLS: ExpectedToolCall[] = [
  // Commercial agent
  { toolName: "web_research.search", minCalls: 2, maxCalls: 5, primaryAgent: "commercial" },
  { toolName: "web_research.fetch_page", minCalls: 1, maxCalls: 4, primaryAgent: "commercial" },
  { toolName: "vdr.list_documents", minCalls: 1, maxCalls: 3, primaryAgent: "commercial" },
  { toolName: "vdr.read_document", minCalls: 2, maxCalls: 8, primaryAgent: "commercial" },
  { toolName: "vdr.search", minCalls: 1, maxCalls: 4, primaryAgent: "commercial" },

  // Financial agent
  { toolName: "finance.extract_kpis", minCalls: 1, maxCalls: 2, primaryAgent: "financial" },
  { toolName: "finance.build_revenue_bridge", minCalls: 1, maxCalls: 2, primaryAgent: "financial" },
  { toolName: "finance.analyse_retention", minCalls: 1, maxCalls: 2, primaryAgent: "financial" },
  { toolName: "finance.detect_anomalies", minCalls: 1, maxCalls: 2, primaryAgent: "financial" },

  // Legal agent
  { toolName: "workflow.draft_seller_question", minCalls: 1, maxCalls: 3, primaryAgent: "legal" },

  // Synthesis agent
  { toolName: "memo.write_section", minCalls: 4, maxCalls: 8, primaryAgent: "synthesis" },
  { toolName: "workflow.list_issues", minCalls: 1, maxCalls: 2, primaryAgent: "synthesis" },
  { toolName: "workflow.resolve_contradiction", minCalls: 0, maxCalls: 2, primaryAgent: "synthesis" },

  // Cross-cutting
  { toolName: "workflow.create_issue", minCalls: 3, maxCalls: 6, primaryAgent: "commercial" },
];

// ---------------------------------------------------------------------------
// 7. Expected approval requests (Tier 2 tools)
// ---------------------------------------------------------------------------

export interface ExpectedApproval {
  toolName: string;
  agent: string;
  description: string;
}

export const EXPECTED_APPROVALS: ExpectedApproval[] = [
  {
    toolName: "workflow.draft_seller_question",
    agent: "legal",
    description:
      "Request to draft a seller question regarding the BuildCo National change-of-control termination right.",
  },
];
