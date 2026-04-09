import type { HarnessEvent } from "../events/types.js";

function ts(offsetSeconds: number): string {
  const base = new Date("2025-01-15T10:00:00.000Z");
  return new Date(base.getTime() + offsetSeconds * 1000).toISOString();
}

const RUN_ID = "replay-demo-001";

/**
 * A complete gold walkthrough of a Project Atlas diligence run (~2 minutes, 36 events).
 * Single orchestrator — no sub-agent delegation.
 * Event payloads match the bridge output format with toolName, result.content, etc.
 */
export const sampleRunEvents: HarnessEvent[] = [
  // ──────────────────────────────────────────────────────────────────
  // Phase 1 — Session start (0-3s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-001",
    eventType: "session.started",
    timestamp: ts(0),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Session started",
    payload: {
      dealId: "deal-atlas-001",
      codeName: "Project Atlas",
    },
  },
  {
    eventId: "evt-002",
    eventType: "steer.received",
    timestamp: ts(2),
    runId: RUN_ID,
    actorName: "user",
    summary: "User: Perform due diligence on Project Atlas",
    payload: {
      content: "Perform due diligence on Project Atlas",
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Phase 2 — Public research (5-25s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-003",
    eventType: "tool.invoked",
    timestamp: ts(5),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Searching: Atlas Software company overview",
    payload: {
      toolCallId: "tc-001",
      toolName: "web-research-search",
      arguments: {
        query: "Atlas Software company overview",
      },
    },
  },
  {
    eventId: "evt-004",
    eventType: "tool.completed",
    timestamp: ts(10),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Web search returned 5 results",
    payload: {
      toolCallId: "tc-001",
      toolName: "web-research-search",
      success: true,
      result: {
        content: "[{\"resultId\": \"wr-001\", \"title\": \"Atlas Software Raises $85M Series D at $1.2B Valuation\", \"publisher\": \"TechCrunch\", \"snippet\": \"Atlas Software, the fast-growing supply-chain SaaS company, has closed an $85M Series D led by Summit Partners, valuing the company at $1.2B.\"}, {\"resultId\": \"wr-002\", \"title\": \"Atlas Software: Disrupting Supply Chain Planning\", \"publisher\": \"Forbes\", \"snippet\": \"With 812 enterprise customers and 63% ARR growth, Atlas is emerging as a category leader in cloud-native supply-chain orchestration.\"}, {\"resultId\": \"wr-003\", \"title\": \"Atlas Software Review 2024 \\u2014 Strengths and Weaknesses\", \"publisher\": \"G2 Research\", \"snippet\": \"Users praise Atlas for ease of deployment and modern UX. Common complaints center on limited SMB feature set and premium pricing.\"}, {\"resultId\": \"wr-004\", \"title\": \"Forrester Wave: Supply-Chain Planning, Q3 2024\", \"publisher\": \"Forrester Research\", \"snippet\": \"Atlas Software named a Leader with highest scores in strategy and current offering. Strong vision but nascent partner ecosystem.\"}, {\"resultId\": \"wr-005\", \"title\": \"Atlas Software Competitors and Market Share\", \"publisher\": \"Gartner\", \"snippet\": \"Atlas competes with Kinaxis, o9 Solutions, and Blue Yonder. Differentiation centers on cloud-native architecture and rapid deployment.\"}]",
      },
    },
  },
  {
    eventId: "evt-005",
    eventType: "tool.invoked",
    timestamp: ts(12),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opening page: Atlas Software Raises $85M Series D",
    payload: {
      toolCallId: "tc-002",
      toolName: "web-research-open_page",
      arguments: {
        resultId: "wr-001",
      },
    },
  },
  {
    eventId: "evt-006",
    eventType: "tool.completed",
    timestamp: ts(16),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opened TechCrunch article on Series D",
    payload: {
      toolCallId: "tc-002",
      toolName: "web-research-open_page",
      success: true,
      result: {
        content: "{\"resultId\": \"wr-001\", \"title\": \"Atlas Software Raises $85M Series D at $1.2B Valuation\", \"publisher\": \"TechCrunch\", \"text\": \"Atlas Software announced today it has raised $85M in Series D funding led by Summit Partners, with participation from existing investors Bessemer Venture Partners and Accel. The round values the company at $1.2 billion. CEO Maria Chen said the funds will be used to expand the enterprise sales team and accelerate international growth. Atlas reports $62.4M in ARR growing 63% year-over-year, with net revenue retention of 140%. The company serves 812 customers including MegaMart, RetailCo, and FreshDirect.\"}",
      },
    },
  },
  {
    eventId: "evt-007",
    eventType: "tool.invoked",
    timestamp: ts(18),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opening page: Forrester Wave Supply-Chain Planning",
    payload: {
      toolCallId: "tc-003",
      toolName: "web-research-open_page",
      arguments: {
        resultId: "wr-004",
      },
    },
  },
  {
    eventId: "evt-008",
    eventType: "tool.completed",
    timestamp: ts(22),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opened Forrester Wave report",
    payload: {
      toolCallId: "tc-003",
      toolName: "web-research-open_page",
      success: true,
      result: {
        content: "{\"resultId\": \"wr-004\", \"title\": \"Forrester Wave: Supply-Chain Planning, Q3 2024\", \"publisher\": \"Forrester Research\", \"text\": \"Atlas Software received the highest scores in strategy and current offering categories in the Q3 2024 Forrester Wave for Supply-Chain Planning. The report highlights Atlas\\u2019s cloud-native architecture, modern developer experience, and rapid time-to-value as key differentiators. However, Forrester notes a nascent partner ecosystem and limited coverage of manufacturing-specific use cases as areas for improvement. Atlas ranked ahead of Kinaxis and o9 Solutions in overall score.\"}",
      },
    },
  },
  {
    eventId: "evt-009",
    eventType: "agent.responded",
    timestamp: ts(25),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Public research complete. Atlas Software is a $62.4M ARR supply-chain SaaS platform growing 63% YoY, recently valued at $1.2B after an $85M Series D. Forrester named it a Leader in Supply-Chain Planning (Q3 2024). Key risks to investigate: SMB product gaps noted in reviews and customer concentration among enterprise accounts.",
    payload: {},
  },

  // ──────────────────────────────────────────────────────────────────
  // Phase 3 — VDR review (27-50s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-010",
    eventType: "tool.invoked",
    timestamp: ts(27),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Searching VDR: financials customer contracts",
    payload: {
      toolCallId: "tc-004",
      toolName: "vdr-search_documents",
      arguments: {
        query: "financials customer contracts",
      },
    },
  },
  {
    eventId: "evt-011",
    eventType: "tool.completed",
    timestamp: ts(32),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "VDR search returned 9 documents",
    payload: {
      toolCallId: "tc-004",
      toolName: "vdr-search_documents",
      success: true,
      result: {
        content: "[{\"documentId\": \"vdr-001\", \"name\": \"Confidential Information Memorandum (CIM)\", \"category\": \"Overview\", \"pages\": 48}, {\"documentId\": \"vdr-002\", \"name\": \"Audited Financial Statements FY2023-2024\", \"category\": \"Financial\", \"pages\": 124}, {\"documentId\": \"vdr-003\", \"name\": \"Customer List with ARR by Account\", \"category\": \"Commercial\", \"pages\": 12}, {\"documentId\": \"vdr-004\", \"name\": \"Revenue Cohort Analysis by Segment\", \"category\": \"Financial\", \"pages\": 8}, {\"documentId\": \"vdr-005\", \"name\": \"Top 10 Customer Contracts (Executed)\", \"category\": \"Legal\", \"pages\": 286}, {\"documentId\": \"vdr-006\", \"name\": \"Employee Census and Org Chart\", \"category\": \"HR\", \"pages\": 15}, {\"documentId\": \"vdr-007\", \"name\": \"Product Roadmap 2025-2026\", \"category\": \"Technology\", \"pages\": 22}, {\"documentId\": \"vdr-008\", \"name\": \"IP Schedule and Patent Portfolio\", \"category\": \"Legal\", \"pages\": 34}, {\"documentId\": \"vdr-009\", \"name\": \"Cap Table and Option Pool Summary\", \"category\": \"Financial\", \"pages\": 6}]",
      },
    },
  },
  {
    eventId: "evt-012",
    eventType: "tool.invoked",
    timestamp: ts(34),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opening VDR document: CIM",
    payload: {
      toolCallId: "tc-005",
      toolName: "vdr-open_document",
      arguments: {
        documentId: "vdr-001",
      },
    },
  },
  {
    eventId: "evt-013",
    eventType: "tool.completed",
    timestamp: ts(38),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opened CIM \u2014 48 pages",
    payload: {
      toolCallId: "tc-005",
      toolName: "vdr-open_document",
      success: true,
      result: {
        content: "{\"documentId\": \"vdr-001\", \"name\": \"Confidential Information Memorandum (CIM)\", \"text\": \"Atlas Software CIM \\u2014 Prepared by Goldman Sachs. Atlas is a cloud-native supply-chain planning platform with $62.4M ARR growing 63% YoY. The company serves 812 customers across Enterprise, Mid-Market, and SMB segments. Blended NRR is 140% and blended GRR is 92%. The company raised $85M Series D at a $1.2B valuation. Management projects $98M ARR by Q4 2025, implying 57% growth. Key growth drivers: enterprise expansion, international markets, and new AI-powered forecasting module.\"}",
      },
    },
  },
  {
    eventId: "evt-014",
    eventType: "tool.invoked",
    timestamp: ts(40),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opening VDR document: Customer list",
    payload: {
      toolCallId: "tc-006",
      toolName: "vdr-open_document",
      arguments: {
        documentId: "vdr-003",
      },
    },
  },
  {
    eventId: "evt-015",
    eventType: "tool.completed",
    timestamp: ts(44),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opened Customer List \u2014 812 accounts",
    payload: {
      toolCallId: "tc-006",
      toolName: "vdr-open_document",
      success: true,
      result: {
        content: "{\"documentId\": \"vdr-003\", \"name\": \"Customer List with ARR by Account\", \"text\": \"Customer ARR schedule showing 812 active accounts. Top 5 by ARR: MegaMart $4.2M (Enterprise, signed 2021), RetailCo $3.1M (Enterprise, signed 2022), FreshDirect $2.4M (Enterprise, signed 2021), BuildRight $1.6M (Mid-Market, signed 2023), SupplyPro $1.3M (Mid-Market, signed 2022). Top 5 represent 20.2% of total ARR ($12.6M of $62.4M). Enterprise segment: 68 accounts, $36.2M ARR (58%). Mid-Market: 244 accounts, $17.5M ARR (28%). SMB: 500 accounts, $8.7M ARR (14%).\"}",
      },
    },
  },
  {
    eventId: "evt-016",
    eventType: "tool.invoked",
    timestamp: ts(46),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opening VDR document: Top 10 customer contracts",
    payload: {
      toolCallId: "tc-007",
      toolName: "vdr-open_document",
      arguments: {
        documentId: "vdr-005",
      },
    },
  },
  {
    eventId: "evt-017",
    eventType: "tool.completed",
    timestamp: ts(50),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Opened top customer contracts \u2014 286 pages",
    payload: {
      toolCallId: "tc-007",
      toolName: "vdr-open_document",
      success: true,
      result: {
        content: "{\"documentId\": \"vdr-005\", \"name\": \"Top 10 Customer Contracts (Executed)\", \"text\": \"Contract summaries for top 10 customers. MegaMart: 3-year term, $4.2M ARR, 60-day change-of-control termination right (no cure period), uncapped data breach indemnification, MFN pricing clause. RetailCo: 3-year term, $3.1M ARR, 90-day CoC termination with 30-day cure, 12x ACV liability cap, MFN on per-seat pricing. FreshDirect: 2-year term, $2.4M ARR, 120-day renegotiation window on CoC, co-ownership of custom integration modules, 12x ACV liability cap. BuildRight: standard terms, $1.6M ARR, no CoC provisions. SupplyPro: standard terms, $1.3M ARR, no CoC provisions.\"}",
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Phase 4 — Financial analysis (52-65s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-018",
    eventType: "tool.invoked",
    timestamp: ts(52),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Loading KPI data",
    payload: {
      toolCallId: "tc-008",
      toolName: "finance-load_kpis",
      arguments: {},
    },
  },
  {
    eventId: "evt-019",
    eventType: "tool.completed",
    timestamp: ts(56),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "KPI data loaded",
    payload: {
      toolCallId: "tc-008",
      toolName: "finance-load_kpis",
      success: true,
      result: {
        content: "{\"arr\": 62.4, \"arrGrowthYoY\": 0.63, \"gaapRevenue\": 58.8, \"nrr\": 1.4, \"grr\": 0.92, \"enterpriseNrr\": 1.65, \"midMarketNrr\": 1.18, \"smbNrr\": 0.92, \"enterpriseGrr\": 0.97, \"midMarketGrr\": 0.91, \"smbGrr\": 0.74, \"customers\": 812, \"monthlyBurn\": 3.2, \"cashOnHand\": 58.0, \"runwayMonths\": 18}",
      },
    },
  },
  {
    eventId: "evt-020",
    eventType: "tool.invoked",
    timestamp: ts(58),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Computing cohort retention analysis",
    payload: {
      toolCallId: "tc-009",
      toolName: "finance-compute_cohorts",
      arguments: {},
    },
  },
  {
    eventId: "evt-021",
    eventType: "tool.completed",
    timestamp: ts(62),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Cohort analysis complete \u2014 SMB GRR declining",
    payload: {
      toolCallId: "tc-009",
      toolName: "finance-compute_cohorts",
      success: true,
      result: {
        content: "{\"cohorts\": [{\"segment\": \"Enterprise\", \"vintage\": \"2022\", \"month12Grr\": 0.98, \"month24Grr\": 0.96}, {\"segment\": \"Enterprise\", \"vintage\": \"2023\", \"month12Grr\": 0.97, \"month24Grr\": null}, {\"segment\": \"Mid-Market\", \"vintage\": \"2022\", \"month12Grr\": 0.93, \"month24Grr\": 0.9}, {\"segment\": \"Mid-Market\", \"vintage\": \"2023\", \"month12Grr\": 0.91, \"month24Grr\": null}, {\"segment\": \"SMB\", \"vintage\": \"2022\", \"month12Grr\": 0.85, \"month24Grr\": 0.78}, {\"segment\": \"SMB\", \"vintage\": \"2023\", \"month12Grr\": 0.8, \"month24Grr\": null}, {\"segment\": \"SMB\", \"vintage\": \"2024-Q1\", \"month12Grr\": 0.74, \"month24Grr\": null}], \"insight\": \"SMB gross retention has declined from 85% to 74% over the last four quarters. Enterprise retention remains best-in-class at 97%.\"}",
      },
    },
  },
  {
    eventId: "evt-022",
    eventType: "tool.invoked",
    timestamp: ts(63),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Building revenue bridge",
    payload: {
      toolCallId: "tc-010",
      toolName: "finance-revenue_bridge",
      arguments: {},
    },
  },
  {
    eventId: "evt-023",
    eventType: "tool.completed",
    timestamp: ts(65),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Revenue bridge complete \u2014 $2M reconciliation gap found",
    payload: {
      toolCallId: "tc-010",
      toolName: "finance-revenue_bridge",
      success: true,
      result: {
        content: "{\"reportedArr\": 62.4, \"segmentBuildArr\": 60.4, \"gap\": 2.0, \"components\": [{\"segment\": \"Enterprise\", \"arr\": 36.2}, {\"segment\": \"Mid-Market\", \"arr\": 17.5}, {\"segment\": \"SMB\", \"arr\": 8.7}, {\"segment\": \"Unclassified/Usage\", \"arr\": -2.0}], \"note\": \"Segment-level ARR sums to $60.4M vs. CIM-reported $62.4M. $2.0M gap may be attributable to reclassified usage-based revenue or timing of Q4 enterprise bookings. Management has not provided a reconciliation.\"}",
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Phase 5 — Issue creation (68-85s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-024",
    eventType: "issue.created",
    timestamp: ts(68),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Issue created: SMB retention deteriorating",
    payload: {
      toolCallId: "tc-011",
      toolName: "workflow-create_issue",
      success: true,
      result: {
        content: "{\"issueId\": \"ISS-001\", \"title\": \"SMB retention deteriorating\", \"description\": \"SMB gross retention fell from 85% to 74% over 4 quarters. Blended GRR of 92% masks the severity of SMB churn. At current trajectory, SMB segment could become cash-flow negative within 2 quarters.\", \"severity\": \"high\", \"workstream\": \"financial\", \"nextAction\": \"Request segment-level cohort data from management\"}",
      },
    },
  },
  {
    eventId: "evt-025",
    eventType: "issue.created",
    timestamp: ts(72),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Issue created: Customer concentration exceeds management framing",
    payload: {
      toolCallId: "tc-012",
      toolName: "workflow-create_issue",
      success: true,
      result: {
        content: "{\"issueId\": \"ISS-002\", \"title\": \"Customer concentration exceeds management framing\", \"description\": \"Top 5 customers represent 20.2% of ARR ($12.6M). CIM downplays concentration by citing 812 total customers without disclosing segment-level revenue distribution. MegaMart alone is 6.7% of ARR.\", \"severity\": \"medium\", \"workstream\": \"commercial\", \"nextAction\": \"Validate revenue dependency with customer-level ARR schedule\"}",
      },
    },
  },
  {
    eventId: "evt-026",
    eventType: "issue.created",
    timestamp: ts(76),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Issue created: Change-of-control termination risk in top contract",
    payload: {
      toolCallId: "tc-013",
      toolName: "workflow-create_issue",
      success: true,
      result: {
        content: "{\"issueId\": \"ISS-003\", \"title\": \"Change-of-control termination risk in top contract\", \"description\": \"MegaMart ($4.2M ARR) has a 60-day CoC termination right with no cure period. RetailCo and FreshDirect have similar provisions. Combined CoC-exposed ARR is $9.7M (15.5% of total). This represents material transaction risk.\", \"severity\": \"high\", \"workstream\": \"legal\", \"nextAction\": \"Obtain executed contracts for MegaMart, RetailCo, FreshDirect\"}",
      },
    },
  },
  {
    eventId: "evt-027",
    eventType: "issue.created",
    timestamp: ts(80),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Issue created: Revenue bridge reconciliation gap",
    payload: {
      toolCallId: "tc-014",
      toolName: "workflow-create_issue",
      success: true,
      result: {
        content: "{\"issueId\": \"ISS-004\", \"title\": \"Revenue bridge reconciliation gap\", \"description\": \"Segment-level ARR sums to $60.4M vs. CIM-reported $62.4M \\u2014 a $2.0M gap (3.2% of reported ARR). Management has not provided a reconciliation. Gap may be attributable to reclassified usage revenue or Q4 booking timing.\", \"severity\": \"medium\", \"workstream\": \"financial\", \"nextAction\": \"Request management bridge walk from segment ARR to reported ARR\"}",
      },
    },
  },
  {
    eventId: "evt-028",
    eventType: "issue.created",
    timestamp: ts(85),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Issue created: Management turnover and key-person risk",
    payload: {
      toolCallId: "tc-015",
      toolName: "workflow-create_issue",
      success: true,
      result: {
        content: "{\"issueId\": \"ISS-005\", \"title\": \"Management turnover and key-person risk\", \"description\": \"VP Sales departed in Q3 2024 with two enterprise AE positions still vacant. Pipeline coverage for Q1 2025 enterprise quota may be at risk. CEO Maria Chen is the primary relationship holder for top 3 accounts.\", \"severity\": \"medium\", \"workstream\": \"commercial\", \"nextAction\": \"Review org chart, open requisitions, and interim pipeline coverage\"}",
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Phase 6 — Memo writing (88-105s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-029",
    eventType: "memo.updated",
    timestamp: ts(88),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Memo section written: Executive Summary",
    payload: {
      toolCallId: "tc-016",
      toolName: "memo-write_section",
      success: true,
      result: {
        content: "{\"message\": \"Section updated successfully.\", \"section\": {\"name\": \"Executive Summary\", \"markdown\": \"## Executive Summary\\n\\n### Opportunity Overview\\n\\nAtlas Software is a cloud-native supply-chain planning SaaS platform with **$62.4M ARR** growing **63% YoY** from a $38.3M base. The company raised an $85M Series D in 2024 led by Summit Partners at a $1.2B valuation (wr-001, public_live). Atlas serves 812 customers across Enterprise (68 accounts, $36.2M ARR), Mid-Market (244 accounts, $17.5M ARR), and SMB (500 accounts, $8.7M ARR) segments (vdr-003, synthetic_private). Forrester named Atlas a Leader in the Q3 2024 Supply-Chain Planning Wave with highest scores in strategy and current offering (wr-004, public_live). The company competes primarily against Kinaxis, o9 Solutions, and Blue Yonder, differentiating on cloud-native architecture and rapid time-to-value.\\n\\n### Investment Thesis\\n\\n- **Durable enterprise franchise**: Enterprise NRR of 165% indicates deep platform adoption and strong expansion dynamics. Enterprise GRR of 97% is best-in-class for vertical SaaS (confidence: high, 0.92 — corroborated across CIM, KPI workbook, and cohort data).\\n- **Category leadership in a growing market**: Forrester Leader positioning and $18B+ TAM in supply-chain planning software provide a secular growth tailwind. Cloud-native architecture creates meaningful switching costs — average enterprise deployment integrates with 4.2 ERP and WMS systems (vdr-007).\\n- **Proven go-to-market**: 63% ARR growth sustained over two consecutive fiscal years with improving enterprise sales efficiency — CAC payback of 14 months on enterprise deals (vdr-004).\\n\\n### Key Risks\\n\\n- **SMB segment in decay (HIGH)**: SMB gross retention has deteriorated from 85% to 74% over four quarters (vdr-004, synthetic_private). The 2024 Q1 SMB cohort is retaining at 74% at Month 12 vs. 85% for the 2022 vintage — an 11-point deterioration. Blended GRR of 92% masks the severity because enterprise accounts (58% of ARR) carry a 97% GRR. At current trajectory, the SMB segment ($8.7M ARR) will become cash-flow negative within 2 quarters. Management has not addressed this trend in the CIM (vdr-001).\\n- **Customer concentration with CoC exposure (HIGH)**: Top 5 customers represent 20.2% of ARR ($12.6M of $62.4M). Three of these five contracts — MegaMart ($4.2M), RetailCo ($3.1M), FreshDirect ($2.4M) — contain change-of-control termination rights totaling $9.7M or 15.5% of ARR (vdr-005). The MegaMart contract has a 60-day CoC termination right with no cure period. This represents material transaction risk that must be mitigated through deal structuring or customer outreach pre-close.\\n- **Revenue bridge reconciliation gap (MEDIUM)**: Segment-level ARR sums to $60.4M vs. the CIM-reported $62.4M — a $2.0M gap (3.2% of reported ARR). Management has not provided a reconciliation walk (vdr-001, vdr-003). The gap may be attributable to reclassified usage-based revenue or Q4 enterprise booking timing, but unresolved discrepancies of this magnitude warrant further investigation.\\n\\n### Preliminary Assessment\\n\\n**Proceed to Phase 2 with conditions** (confidence: medium, 0.75). Atlas presents an attractive enterprise franchise with durable product moats, strong expansion dynamics, and category leadership. However, three material issues — SMB retention decay, CoC-exposed ARR concentration, and the $2M revenue reconciliation gap — must be resolved through management sessions and additional data requests before advancing to final valuation. The SMB segment trajectory and contract transferability risk should be reflected in pricing if confirmed.\", \"evidenceIds\": [\"vdr-001\", \"vdr-003\", \"vdr-004\", \"vdr-005\", \"vdr-007\", \"wr-001\", \"wr-004\"]}}",
      },
    },
  },
  {
    eventId: "evt-030",
    eventType: "memo.updated",
    timestamp: ts(92),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Memo section written: Commercial",
    payload: {
      toolCallId: "tc-017",
      toolName: "memo-write_section",
      success: true,
      result: {
        content: "{\"message\": \"Section updated successfully.\", \"section\": {\"name\": \"Commercial\", \"markdown\": \"## Commercial Analysis\\n\\n### Market Position\\n\\nAtlas operates in the cloud supply-chain planning software market, which Forrester estimates at $18.2B TAM growing 14% annually (wr-004, public_live). The company's SAM — mid-to-large enterprises with complex multi-node supply chains — is approximately $6.5B based on Gartner's 2024 segmentation (wr-005, public_live). Atlas holds an estimated 0.96% market share by revenue ($62.4M / $6.5B SAM), positioning it as a high-growth challenger rather than an incumbent. Forrester named Atlas a Leader in the Q3 2024 Supply-Chain Planning Wave with the highest combined scores in strategy and current offering, ranking ahead of Kinaxis and o9 Solutions (wr-004). However, Forrester flags a nascent partner ecosystem and limited coverage of manufacturing-specific use cases as areas for improvement.\\n\\nPrimary competitors include Kinaxis (public, ~$400M revenue, mature partner network), o9 Solutions (private, estimated $150-200M ARR, strong AI positioning), and Blue Yonder (Panasonic-owned, broad supply chain suite). Atlas differentiates on cloud-native architecture, modern developer UX, and rapid time-to-value — G2 reviews cite average deployment time of 8-12 weeks vs. 6-12 months for legacy competitors (wr-003, public_live). This architectural advantage creates meaningful switching costs: the average enterprise deployment integrates with 4.2 ERP/WMS systems and contains 18 months of proprietary demand forecasting model training data (vdr-007, synthetic_private).\\n\\n### Customer Analysis\\n\\nAtlas serves **812 total customers** segmented as follows (vdr-003, synthetic_private):\\n\\n| Segment | Accounts | ARR | % of Total ARR | Avg ACV |\\n|---------|----------|-----|----------------|---------|\\n| Enterprise (>$200K ACV) | 68 | $36.2M | 58% | $532K |\\n| Mid-Market ($50-200K ACV) | 244 | $17.5M | 28% | $72K |\\n| SMB (<$50K ACV) | 500 | $8.7M | 14% | $17K |\\n\\nThe Enterprise segment drives the majority of ARR and expansion. Enterprise ACV of $532K is strong for vertical SaaS and suggests deep platform adoption. Mid-Market ACV of $72K is consistent with 2-3 module deployments. SMB ACV of $17K suggests single-module usage with limited expansion runway, which is consistent with the deteriorating SMB retention metrics (see Financial section).\\n\\n### Concentration Risk\\n\\n**Top 5 customers represent 20.2% of ARR ($12.6M of $62.4M)** (vdr-003, synthetic_private), which crosses the 20% threshold flagged in our commercial analysis framework:\\n\\n| Customer | ARR | % of Total | Segment | Signed | CoC Clause? |\\n|----------|-----|-----------|---------|--------|-------------|\\n| MegaMart | $4.2M | 6.7% | Enterprise | 2021 | Yes — 60-day termination, no cure |\\n| RetailCo | $3.1M | 5.0% | Enterprise | 2022 | Yes — 90-day termination, 30-day cure |\\n| FreshDirect | $2.4M | 3.8% | Enterprise | 2021 | Yes — 120-day renegotiation |\\n| BuildRight | $1.6M | 2.6% | Mid-Market | 2023 | No |\\n| SupplyPro | $1.3M | 2.1% | Mid-Market | 2022 | No |\\n\\nMegaMart alone represents 6.7% of total ARR — a single-name concentration risk. Notably, CEO Maria Chen is the primary relationship holder for all three enterprise accounts with CoC provisions (ISS-005), creating a compounding key-person/concentration risk.\\n\\n**Public-Private Delta — Concentration Framing**: The CIM (vdr-001, p.8) highlights '812 customers across three segments' without disclosing the segment-level revenue distribution or that the Top 5 represent 20.2% of ARR. This framing choice — leading with customer count rather than revenue concentration — is a management narrative technique that downplays the actual concentration profile. **Contradiction severity: Medium** (confidence: 0.88).\\n\\n### Competitive Moat Assessment\\n\\n**Switching costs (STRONG)**: Enterprise deployments integrate deeply with existing ERP/WMS infrastructure (avg. 4.2 system integrations per deployment). Customers invest 8-12 weeks in initial deployment and accumulate 18+ months of proprietary demand model training data. Rip-and-replace cost is estimated at 6-9 months of implementation time plus lost model accuracy. This creates substantial customer lock-in at the enterprise level.\\n\\n**Product differentiation (MODERATE)**: Cloud-native architecture is a genuine differentiator today but will erode over 3-5 years as competitors (Kinaxis, Blue Yonder) complete their own cloud migrations. Atlas's advantage is in time-to-market, not in fundamentally proprietary technology. The AI-powered forecasting module (2025 roadmap, vdr-007) could extend the differentiation window if executed well.\\n\\n**Pricing power (MODERATE)**: Enterprise NRR of 165% suggests strong expansion pricing dynamics. However, G2 reviews consistently cite 'premium pricing' as a weakness (wr-003), and the MegaMart and RetailCo contracts contain MFN clauses that constrain future discounting flexibility (vdr-005).\\n\\n### Go-to-Market Efficiency\\n\\n- **Enterprise sales cycle**: 4.2 months average; CAC payback period: 14 months (strong, target <18 months)\\n- **Mid-Market sales cycle**: 1.8 months average; CAC payback period: 18 months (at threshold)\\n- **SMB sales cycle**: 0.8 months; CAC payback period: 26 months (above target — SMB unit economics are deteriorating)\\n- **Channel mix**: 85% direct sales, 12% partner referral, 3% self-serve. The nascent partner ecosystem (flagged by Forrester) limits indirect scale.\\n\\n**GTM risk**: VP Sales departed in Q3 2024 with two enterprise AE positions still vacant (vdr-006, synthetic_private). Pipeline coverage for Q1 2025 enterprise quota may be at risk. CEO is currently carrying the top 3 account relationships directly — this is a key-person dependency that compounds the concentration risk.\", \"evidenceIds\": [\"vdr-001\", \"vdr-003\", \"vdr-005\", \"vdr-006\", \"vdr-007\", \"wr-001\", \"wr-002\", \"wr-003\", \"wr-004\", \"wr-005\"]}}",
      },
    },
  },
  {
    eventId: "evt-031",
    eventType: "memo.updated",
    timestamp: ts(96),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Memo section written: Financial",
    payload: {
      toolCallId: "tc-018",
      toolName: "memo-write_section",
      success: true,
      result: {
        content: "{\"message\": \"Section updated successfully.\", \"section\": {\"name\": \"Financial\", \"markdown\": \"## Financial Analysis\\n\\n### Revenue Quality\\n\\nAtlas reports **$62.4M ARR** as of Q4 2024, up 63% from $38.3M at Q4 2023 (vdr-001, synthetic_private). GAAP recognized revenue is $58.8M LTM (vdr-002, synthetic_private), implying a $3.6M ARR-to-revenue gap (5.8%) attributable to timing differences between bookings and ASC 606 revenue recognition on multi-year contracts. This gap is within acceptable range but should be monitored — a widening gap would indicate increasing reliance on multi-year prepaid contracts to inflate headline ARR.\\n\\nRevenue mix is healthy for a SaaS business: Subscription 89%, Professional Services 8%, Usage-based 3% (vdr-002). The subscription mix exceeds the 85% threshold in our financial analysis framework. Deferred revenue balance is $14.2M, up 48% YoY, which is directionally consistent with bookings growth but trailing ARR growth — suggesting some shortening of average contract duration (confidence: medium, 0.72 — single source).\\n\\n### Growth Decomposition\\n\\nUsing the revenue bridge (finance-revenue_bridge), we decompose the $24.1M YoY ARR increase ($38.3M → $62.4M as reported):\\n\\n| Component | Amount | % of Growth |\\n|-----------|--------|-------------|\\n| New Business | $14.8M | 61% |\\n| Expansion (existing customers) | $12.6M | 52% |\\n| Contraction | ($1.8M) | (7%) |\\n| Gross Churn | ($3.5M) | (15%) |\\n| **Net New ARR** | **$22.1M** | — |\\n\\n**Contradiction — Revenue Bridge Gap**: The segment-level ARR rebuild sums to **$60.4M** (Enterprise $36.2M + Mid-Market $17.5M + SMB $8.7M), which is **$2.0M less than the CIM-reported $62.4M** — a 3.2% discrepancy (vdr-001 vs. vdr-003). The revenue bridge net new ARR of $22.1M applied to the prior year base of $38.3M yields $60.4M, consistent with the segment rebuild but not the CIM headline. Management has not provided a reconciliation walk for the $2.0M gap. Possible explanations include reclassified usage-based revenue, timing of Q4 enterprise bookings not yet reflected in the customer list, or an accounting reclassification between segments. **This is flagged as ISS-004 (severity: medium)** and requires management clarification before final memo. (Confidence in reported ARR: 0.72 — reduced from 0.85 due to unresolved contradiction.)\\n\\nAll reported growth appears organic — no acquisitions were completed during the measurement period (confirmed via public sources wr-001, wr-002 and cap table vdr-009).\\n\\n### Retention Deep-Dive\\n\\nRetention is the highest-signal metric in this diligence, and the segment-level data tells a materially different story than the blended figures.\\n\\n**Blended metrics** (vdr-001, synthetic_private):\\n- NRR: 140% | GRR: 92%\\n\\n**Segment-level metrics** (KPI workbook via finance-load_kpis):\\n\\n| Metric | Enterprise | Mid-Market | SMB |\\n|--------|-----------|-----------|-----|\\n| NRR | 165% | 118% | 92% |\\n| GRR | 97% | 91% | **74%** |\\n| ARR Weight | 58% | 28% | 14% |\\n\\n**Critical finding — Retention masking**: The blended GRR of 92% is carried almost entirely by Enterprise (97% GRR, 58% of ARR). **SMB GRR of 74% is well below our 85% critical threshold** and has deteriorated from 85% just four quarters ago. This is the classic retention masking pattern: strong enterprise expansion (165% NRR) generates headline blended NRR of 140%, which obscures the fact that the SMB base is in accelerating decay.\\n\\n**Cohort analysis** (finance-compute_cohorts) reveals the deterioration is worsening with newer vintages:\\n\\n| Segment | 2022 Cohort (M12 GRR) | 2023 Cohort (M12 GRR) | 2024 Q1 Cohort (M12 GRR) | Trend |\\n|---------|----------------------|----------------------|--------------------------|-------|\\n| Enterprise | 98% | 97% | — | Stable ✓ |\\n| Mid-Market | 93% | 91% | — | Slight decline ⚠ |\\n| SMB | 85% | 80% | **74%** | **Accelerating decay** ✗ |\\n\\nThe 2024 Q1 SMB cohort is retaining 11 percentage points worse than the 2022 vintage at the same stage. If this trajectory continues, the SMB segment ($8.7M ARR) will generate negative unit economics within 2 quarters, as customer acquisition costs cannot be recovered before churn. **This is flagged as ISS-001 (severity: high).** (Confidence: 0.90 — corroborated across KPI workbook and cohort computation.)\\n\\n### Unit Economics\\n\\n| Metric | Enterprise | Mid-Market | SMB | Blended |\\n|--------|-----------|-----------|-----|---------|\\n| CAC Payback (months) | 14 | 18 | **26** | 16 |\\n| Implied LTV/CAC | 5.2x | 3.1x | **1.4x** | 3.8x |\\n| Gross Margin | 78% | 74% | 68% | 75% |\\n\\nEnterprise unit economics are strong (5.2x LTV/CAC, 14-month payback). Mid-Market is at threshold (3.1x, 18 months). **SMB is value-destructive** — 1.4x LTV/CAC with 26-month payback against a 74% GRR means the average SMB customer churns before Atlas recovers acquisition cost. S&M as % of revenue is 52% (vdr-002), which is elevated but consistent with a company at this growth stage. S&M efficiency should improve with scale if enterprise mix continues to increase.\\n\\n### Cash Flow and Runway\\n\\n- **Monthly net burn**: $3.2M (OpEx $7.8M vs. MRR $5.2M less COGS) (vdr-002)\\n- **Cash on hand**: $58.0M post-Series D (vdr-009)\\n- **Implied runway**: ~18 months at current burn, or ~14 months if the planned hiring acceleration (12 new enterprise AEs per CIM) proceeds on schedule\\n- **Path to breakeven**: Management projects breakeven at $110M ARR (CIM p.42), implying 18-24 months at current growth rates. This projection assumes (a) GRR stabilization across all segments, (b) S&M ratio declining to 40%, and (c) gross margin expansion to 80%. Given the SMB deterioration, condition (a) may not hold without segment-level intervention.\\n- **FCF trajectory**: Currently -$38.4M annualized. At 63% growth, the company reaches $100M+ ARR within 12 months, but EBITDA breakeven requires the operating leverage assumptions above. (Confidence in breakeven timeline: 0.55 — management projection with unfavorable headwinds in SMB.)\", \"evidenceIds\": [\"vdr-001\", \"vdr-002\", \"vdr-003\", \"vdr-004\", \"vdr-009\"]}}",
      },
    },
  },
  {
    eventId: "evt-032",
    eventType: "memo.updated",
    timestamp: ts(100),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Memo section written: Legal",
    payload: {
      toolCallId: "tc-019",
      toolName: "memo-write_section",
      success: true,
      result: {
        content: "{\"message\": \"Section updated successfully.\", \"section\": {\"name\": \"Legal\", \"markdown\": \"## Legal Analysis\\n\\n### Contract Transferability — Change-of-Control Provisions\\n\\nThis is the highest-priority legal finding. Three of the Top 5 customers by ARR have change-of-control (CoC) termination or renegotiation rights that could be triggered by an acquisition (vdr-005, synthetic_private):\\n\\n| Customer | ARR | CoC Provision | Notice Period | Cure Period | Risk Level |\\n|----------|-----|--------------|---------------|-------------|------------|\\n| MegaMart | $4.2M | Termination right | 60 days | **None** | **Critical** |\\n| RetailCo | $3.1M | Termination right | 90 days | 30 days | High |\\n| FreshDirect | $2.4M | Renegotiation window | 120 days | N/A — pricing reset to list | High |\\n| BuildRight | $1.6M | None (standard terms) | — | — | Low |\\n| SupplyPro | $1.3M | None (standard terms) | — | — | Low |\\n\\n**Total CoC-exposed ARR: $9.7M (15.5% of total ARR)**. This exceeds our 10% critical threshold and represents material transaction risk.\\n\\nThe MegaMart contract is the highest-risk item in the legal workstream. The 60-day termination right with no cure period means the acquirer has no contractual mechanism to retain this customer if they elect to terminate post-close. Given MegaMart is 6.7% of total ARR ($4.2M), loss of this single contract would reduce growth rate by approximately 4 percentage points and could trigger negative signaling to other enterprise customers. CEO Maria Chen is the primary relationship holder for MegaMart (vdr-006), which compounds the risk — if Chen departs post-acquisition, the relationship anchor is lost simultaneously with the contractual vulnerability.\\n\\n**Contradiction — CoC Narrative**: The CIM states 'minimal change-of-control exposure across the customer base' (vdr-001, p.31). However, executed contracts reveal $9.7M (15.5%) of ARR is subject to CoC provisions, with the largest customer having an uncured termination right. This qualifies as a material mischaracterization of legal risk. **Contradiction severity: HIGH** (confidence: 0.95 — based on executed contract language vs. CIM narrative).\\n\\nRetailCo's 30-day cure period provides some protection but requires proactive customer outreach pre-close. FreshDirect's renegotiation window effectively resets pricing to then-current list rates, which could result in a $400-600K annual revenue reduction if list prices exceed the current contracted rate (estimated based on 20-25% typical enterprise discount).\\n\\n### Assignment and Consent Requirements\\n\\nRetailCo's contract requires written consent for data migration to a new entity. In a stock acquisition, this may not be triggered (entity remains the same); in an asset deal, consent would be required. Two mid-market contracts (not in Top 10) contain anti-assignment provisions that prohibit assignment without counterparty consent. Combined ARR at risk from assignment restrictions: approximately $4.8M (confidence: 0.70 — mid-market contracts reviewed in summary form only; full executed versions should be requested).\\n\\n### Liability and Indemnification\\n\\n- **MegaMart**: Contains **uncapped indemnification for data breaches** — significantly above market standard. In the event of a data security incident affecting MegaMart's supply chain data, Atlas's liability exposure is theoretically unlimited. This is non-standard and should be flagged for renegotiation or carve-out in the purchase agreement.\\n- **RetailCo and FreshDirect**: Liability caps at 12x annual contract value ($37.2M and $28.8M respectively). These are within the industry range of 12-24x but on the lower end — beneficial for the acquirer.\\n- **MFN clauses**: MegaMart and RetailCo both carry most-favored-nation clauses on per-seat pricing (vdr-005). These MFN provisions could constrain the acquirer's pricing strategy for future enterprise deals — any lower per-seat price offered to a new customer would trigger a retroactive price adjustment for MegaMart and RetailCo. **Combined MFN-constrained ARR: $7.3M (11.7%)**.\\n- **Mid-market gap**: Two mid-market contracts (BuildRight and one undisclosed account) **lack limitation-of-liability clauses entirely**, which is a documentation deficiency that should be remediated.\\n\\n### IP Ownership\\n\\nAll customer contracts include standard IP assignment to Atlas for platform improvements (vdr-005). However, the **FreshDirect contract grants co-ownership of custom integration modules** developed during the implementation. This co-ownership provision could create an IP encumbrance if FreshDirect claims rights to integration technology that has been subsequently incorporated into the core platform. The scope of co-owned IP should be catalogued and mapped against the current codebase. (Confidence: 0.65 — contract language reviewed but technical IP mapping not yet performed.)\\n\\nThe IP Schedule (vdr-008) shows 12 patents (7 granted, 5 pending) covering supply-chain optimization algorithms. No pending IP litigation. All employee IP assignment agreements are confirmed in place for current employees; contractor agreements should be verified for 3 former contractors who contributed to the AI forecasting module (vdr-006, vdr-008).\\n\\n### Employment and Key-Person Risk\\n\\n- **CEO Maria Chen**: Primary relationship holder for Top 3 enterprise accounts. Single-trigger acceleration on 850K unvested shares. 12-month non-compete with standard enforceability caveats (vdr-009, vdr-006).\\n- **CTO James Park**: Double-trigger acceleration on 620K unvested shares. Key architect of the cloud-native platform. 12-month non-compete.\\n- **VP Sales (departed Q3 2024)**: Position vacant. Two enterprise AE roles also unfilled. Interim pipeline coverage is being managed by CEO and two remaining senior AEs (vdr-006).\\n\\n### Regulatory and Compliance\\n\\n- **SOC 2 Type II**: Current certification in place, last audit Q2 2024 (vdr-008). No material findings.\\n- **GDPR**: DPA agreements executed with all EU-based customers (confirmed for 47 accounts). Data residency in EU-West (AWS Frankfurt).\\n- **Industry-specific**: No HIPAA or PCI-DSS obligations based on current customer base. If Atlas expands into healthcare supply chain (per roadmap, vdr-007), HIPAA compliance will be required — estimated 6-9 month implementation timeline.\\n\\n### Recommended Seller Questions\\n\\n1. Provide a complete schedule of all contracts with change-of-control provisions, not limited to Top 10.\\n2. Clarify the scope of co-owned IP under the FreshDirect integration agreement — which specific modules are covered?\\n3. Confirm status of IP assignment agreements for the 3 former contractors who contributed to the AI forecasting module.\\n4. Provide copies of the two mid-market contracts lacking limitation-of-liability clauses.\", \"evidenceIds\": [\"vdr-001\", \"vdr-005\", \"vdr-006\", \"vdr-008\", \"vdr-009\"]}}",
      },
    },
  },
  {
    eventId: "evt-033",
    eventType: "memo.updated",
    timestamp: ts(105),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Memo section written: Open Issues",
    payload: {
      toolCallId: "tc-020",
      toolName: "memo-write_section",
      success: true,
      result: {
        content: "{\"message\": \"Section updated successfully.\", \"section\": {\"name\": \"Open Issues\", \"markdown\": \"## Open Issues\\n\\nThe following issues have been identified during diligence, ranked by severity. High-severity items represent potential deal-breakers or >10% value impact. Medium-severity items may require price adjustment or term negotiation. Low-severity items are tracking items for post-close integration.\\n\\n| # | Title | Severity | Workstream | Description | Recommended Next Action |\\n|---|-------|----------|------------|-------------|------------------------|\\n| ISS-001 | SMB retention in accelerating decay | **High** | Financial | SMB GRR has deteriorated from 85% (2022 cohort) to 74% (2024 Q1 cohort) — an 11-point decline over 4 quarters. Blended GRR of 92% masks severity. At current trajectory, SMB segment ($8.7M ARR, 14% of total) becomes unit-economics negative within 2 quarters. The CIM does not acknowledge or address this trend. (Evidence: KPI workbook, cohort analysis; confidence: 0.90) | Request quarterly SMB cohort retention data by vintage for last 8 quarters. Schedule management call to discuss SMB product-market fit strategy and whether segment should be deprioritized. |\\n| ISS-003 | Change-of-control termination risk in top contracts | **High** | Legal | Three of Top 5 customers (MegaMart, RetailCo, FreshDirect) have CoC termination or renegotiation rights. Combined CoC-exposed ARR is $9.7M (15.5% of total). MegaMart's 60-day termination with no cure period is the highest-risk single contract. CIM characterizes CoC exposure as 'minimal' — a material mischaracterization. (Evidence: vdr-005 executed contracts vs. vdr-001 CIM p.31; confidence: 0.95) | Obtain full executed contracts for MegaMart, RetailCo, FreshDirect. Engage customer counsel on pre-close outreach strategy. Model downside scenario with full CoC-exposed ARR loss. |\\n| ISS-002 | Customer concentration exceeds management framing | **Medium** | Commercial | Top 5 customers represent 20.2% of ARR ($12.6M). MegaMart alone is 6.7% ($4.2M). CIM highlights 812 total customers without disclosing segment revenue distribution — a framing choice that downplays concentration. CEO is primary relationship holder for Top 3 accounts, creating compounding key-person/concentration risk. (Evidence: vdr-003 customer list vs. vdr-001 CIM p.8; confidence: 0.88) | Validate revenue dependency with customer-level ARR schedule including contract renewal dates. Assess pipeline diversification for FY2025. |\\n| ISS-004 | Revenue bridge reconciliation gap | **Medium** | Financial | Segment-level ARR sums to $60.4M vs. CIM-reported $62.4M — a $2.0M gap (3.2%). Revenue bridge net new ARR of $22.1M applied to prior year base of $38.3M also yields $60.4M, consistent with segment rebuild but not CIM headline. Management has not provided a reconciliation. Possible causes: reclassified usage revenue, Q4 booking timing, accounting reclassification. (Evidence: vdr-001, vdr-003, finance-revenue_bridge; confidence: 0.72 — reduced due to unresolved contradiction) | Request management bridge walk from segment ARR to reported $62.4M ARR. Clarify treatment of usage-based revenue in ARR calculation. |\\n| ISS-005 | Management turnover and key-person risk | **Medium** | Commercial | VP Sales departed Q3 2024; two enterprise AE positions remain vacant. CEO Maria Chen is carrying Top 3 account relationships directly and holds single-trigger acceleration on 850K unvested shares. CTO James Park has double-trigger on 620K shares. Pipeline coverage for Q1 2025 enterprise quota is at risk. (Evidence: vdr-006 org chart, vdr-009 cap table; confidence: 0.82) | Review org chart, open requisitions, and interim pipeline coverage. Assess retention package requirements for CEO and CTO post-close. |\\n| ISS-006 | FreshDirect IP co-ownership encumbrance | **Low** | Legal | FreshDirect contract grants co-ownership of custom integration modules developed during implementation (vdr-005). Scope of co-owned IP not yet mapped against current codebase. If co-owned modules have been incorporated into core platform, this could create an encumbrance on platform IP. (Evidence: vdr-005, vdr-008; confidence: 0.65) | Catalogue co-owned IP modules and map against current codebase. Verify no co-owned code has been merged into core platform. |\\n| ISS-007 | MFN clauses constrain pricing flexibility | **Low** | Legal | MegaMart and RetailCo carry MFN clauses on per-seat pricing covering $7.3M ARR (11.7% of total). Any lower per-seat price offered to a new enterprise customer would trigger retroactive adjustment. This could constrain go-to-market pricing strategy post-acquisition. (Evidence: vdr-005; confidence: 0.88) | Model impact of MFN constraints on planned pricing strategy. Consider whether MFN carve-outs should be negotiated pre-close. |\\n\\n### Priority Actions (Next 5 Business Days)\\n\\n1. **Schedule management call** — Agenda: (a) revenue bridge reconciliation walk, (b) SMB retention strategy and segment economics, (c) VP Sales replacement timeline and Q1 pipeline coverage.\\n2. **Request executed contracts** — Full executed copies of Top 5 customer contracts plus any additional contracts with CoC provisions not in the current VDR.\\n3. **Obtain granular cohort data** — Monthly SMB retention by vintage for the last 8 quarters, plus segment-level P&L to validate unit economics.\\n4. **Engage customer counsel** — Assess feasibility of pre-close customer outreach for MegaMart, RetailCo, and FreshDirect to mitigate CoC termination risk.\\n5. **IP audit** — Map FreshDirect co-owned integration modules against current codebase; verify contractor IP assignment agreements for AI forecasting module contributors.\", \"evidenceIds\": [\"vdr-001\", \"vdr-003\", \"vdr-005\", \"vdr-006\", \"vdr-008\", \"vdr-009\"]}}",
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Phase 7 — Approval + completion (108-120s)
  // ──────────────────────────────────────────────────────────────────
  {
    eventId: "evt-034",
    eventType: "approval.requested",
    timestamp: ts(108),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Approval requested: Draft seller question about SMB churn data",
    payload: {
      action: "send_seller_question",
      question: "Can management provide quarterly SMB cohort retention data (by vintage) for the last 8 quarters, along with a reconciliation of segment-level ARR to the $62.4M reported in the CIM?",
      rationale: "SMB GRR has declined from 85% to 74% and the segment-level ARR rebuild shows a $2M gap vs. reported figures. Both issues require management clarification before final memo.",
    },
  },
  {
    eventId: "evt-035",
    eventType: "agent.responded",
    timestamp: ts(115),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Diligence complete. Analyzed 14 evidence sources across public research, VDR documents, and financial models. Identified 5 issues (2 high, 3 medium). Draft memo produced with 5 sections. Confidence: moderate-high \u2014 pending management responses on SMB retention and revenue bridge reconciliation.",
    payload: {},
  },
  {
    eventId: "evt-036",
    eventType: "session.ended",
    timestamp: ts(120),
    runId: RUN_ID,
    actorName: "orchestrator",
    summary: "Session complete",
    payload: {
      issuesTotal: 5,
      memoSections: 5,
      evidenceCount: 14,
      duration: "2m 0s",
    },
  },
];
