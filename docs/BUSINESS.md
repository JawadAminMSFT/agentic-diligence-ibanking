# Diligence Agentic Harness — Business Use Case

## Executive Summary

The Diligence Agentic Harness is an AI-powered platform that automates due diligence for mergers and acquisitions. It orchestrates specialist AI agents to gather public intelligence, analyze private data room documents, detect contradictions between management claims and actual data, surface risks, and draft investment committee deliverables — reducing first-pass diligence from weeks to minutes.

Built for **private equity firms**, **corporate development teams**, **investment banks**, and **M&A advisory practices**, the platform delivers consistent, evidence-backed analysis across every deal while keeping human analysts in control of sensitive decisions.

---

## The Problem: Manual Due Diligence Is Broken

Due diligence today is a labor-intensive, error-prone process that has barely changed in two decades. The typical engagement involves:

- **2-4 weeks of analyst time per deal**, with junior team members manually reviewing hundreds of documents — CIMs, virtual data room files, financial models, customer contracts, and legal agreements.
- **Cross-referencing public claims against private data is tedious and inconsistent.** Management presentations often frame metrics favorably (e.g., describing customer concentration as "diversified" with "no single customer above 10%"), while the underlying data tells a different story (e.g., the Top 5 customers representing 29.6% of ARR).
- **Critical issues get missed.** Change-of-control termination rights buried in contract appendices, deteriorating segment-level retention masked by headline metrics, and revenue bridge discrepancies can all slip through when analysts are fatigued or under time pressure.
- **Memos are inconsistent across deals.** Each analyst writes differently, applies different frameworks, and surfaces risks at different levels of rigor. Institutional knowledge about what to look for is locked in senior partners' heads, not encoded in a repeatable process.
- **Deal teams rely on disconnected tools.** Email threads for Q&A, Excel for financial analysis, Word for memos, PowerPoint for IC decks — no single system provides a unified view of diligence findings, provenance, or confidence levels.

The result: deals close with unidentified risks, IC materials vary in quality, and firms cannot scale their diligence capacity without linearly adding headcount.

---

## The Solution: AI-First Diligence

The Diligence Agentic Harness replaces the manual first pass with an autonomous agent workflow that delivers structured, evidence-backed analysis in minutes.

- **Autonomous first-pass diligence.** The platform deploys specialist AI agents — commercial, financial, legal, and synthesis — that work in parallel to analyze a deal from every angle. A complete first-pass analysis runs in **3-5 minutes**, not 2-4 weeks.
- **Structured, repeatable workflow.** Every deal follows the same rigorous methodology: public intelligence gathering, private data room analysis, financial deep-dive, risk identification, and deliverable generation. The process is encoded in reusable skill modules, ensuring institutional consistency.
- **Evidence-backed findings with provenance.** Every claim in the output traces to a specific source — a public filing, a VDR document, a financial metric — with clear **provenance labels** distinguishing public sources from private data room materials. Confidence scores quantify the strength of each finding.
- **Automatic contradiction detection.** The synthesis agent reconciles management narratives against actual data. When the CIM claims "stable retention across all segments" but segment-level data shows SMB gross revenue retention dropping from 85% to 78% over four quarters, the platform flags it automatically.
- **Human-in-the-loop control.** Analysts review findings, steer the agent's focus, and approve sensitive actions. Seller-facing questions require explicit human approval before being sent. The platform augments analyst judgment — it does not replace it.

---

## Supported Deal Types

### Current Focus: SaaS and Software Acquisitions

The platform is purpose-built for software and SaaS deal diligence, with deep domain expertise in:

- **Recurring revenue analysis** — ARR, MRR, net and gross revenue retention by segment
- **Cohort and segment decomposition** — Enterprise, mid-market, and SMB performance isolation
- **Customer concentration assessment** — Quantified risk from revenue dependency on top accounts
- **Contract risk identification** — Change-of-control provisions, termination rights, renewal terms
- **Revenue quality analysis** — New business vs. expansion classification, revenue bridge reconciliation

### Broader Applicability

The modular architecture supports extension to additional verticals through customizable skill modules:

- **Healthcare** — Regulatory compliance, payor mix, reimbursement risk analysis
- **Cybersecurity** — Product certification validation, threat landscape mapping, customer retention patterns
- **Fintech** — Regulatory exposure, transaction volume trends, credit risk assessment
- **Enterprise Software** — License vs. subscription mix, migration pipeline, partner channel analysis

### Multi-Deal Pipeline

Firms managing multiple concurrent opportunities can run diligence on several targets simultaneously. Each deal operates in an isolated session with its own data room, findings, and deliverables — enabling deal teams to maintain velocity across a full pipeline.

---

## Workflow and Capabilities

The platform executes a structured five-phase workflow for every deal:

### Phase 1: Public Intelligence Gathering

The web research agent systematically collects public information about the target company:

- Company news, press releases, and industry coverage
- Investor relations materials and public financial filings
- Employee and customer reviews on third-party platforms
- Competitive landscape and peer benchmarking data
- Management team backgrounds and public statements

All public findings are tagged with source provenance and timestamps, creating a baseline of publicly available claims that will be tested against private data.

### Phase 2: Private Data Room Analysis

The VDR agent performs a structured review of all documents in the virtual data room:

- **Confidential Information Memorandum (CIM)** — Extracts management's narrative, stated KPIs, and growth thesis
- **Customer lists and contracts** — Identifies concentration risk, change-of-control provisions, renewal terms, and pricing structures
- **KPI workbooks and financial models** — Pulls actual performance metrics for comparison against management's framing
- **Legal documents** — Reviews material contracts, IP assignments, litigation disclosures, and regulatory filings

The agent cross-references private data against public claims from Phase 1, flagging discrepancies for further analysis.

### Phase 3: Financial Deep-Dive

The financial analysis agent performs quantitative analysis across multiple dimensions:

- **KPI extraction and validation** — Pulls ARR, retention rates, growth rates, and unit economics from source data. For example, the agent identifies that while headline net revenue retention is 112%, SMB segment gross retention has deteriorated from 85% to 78% over four quarters.
- **Cohort analysis** — Decomposes performance by customer segment (enterprise, mid-market, SMB) to reveal divergent trends hidden in blended metrics.
- **Revenue bridge reconciliation** — Compares management's reported revenue bridge components against segment-level data. When the CIM reports $8M in new business but segment data totals only $6.2M, the agent flags the $1.8M gap as a potential reclassification of expansion revenue.

### Phase 4: Risk Identification

The platform synthesizes findings from all workstreams into structured issues:

- Each issue is assigned a **severity rating** (high, medium, low) based on potential deal impact
- Issues include **evidence citations** linking to specific source documents and data points
- **Recommended actions** accompany each issue — whether to request additional data, draft a seller question, adjust valuation assumptions, or flag for legal review
- **Contradiction issues** are specifically highlighted when management claims conflict with actual data

Example issues the platform surfaces:

- *High severity*: "Top customer BuildCo National ($4.2M ARR, 8.75% of total) has a contractual right to terminate upon change of control — not disclosed in the CIM"
- *High severity*: "SMB segment gross revenue retention has declined from 85% to 78% over four quarters, masked by enterprise expansion in headline NRR"
- *Medium severity*: "Top 5 customer concentration is 29.6% of ARR, contradicting management's characterization of a 'diversified' customer base"
- *Medium severity*: "Revenue bridge does not reconcile — $1.8M gap between reported new business ($8M) and segment-level new customer data ($6.2M)"

### Phase 5: Deliverable Generation

The platform produces three IC-ready deliverables from the findings:

- **Investment Memo (PDF)** — A complete IC-quality document
- **Summary Deck (PPTX)** — A concise presentation for IC review
- **Interactive Dashboard** — Real-time analytics accessible through the operator UI

---

## Artifact Outputs

### Investment Memo (PDF)

A six-section, IC-quality document that follows a standardized format:

1. **Executive Summary** — Deal overview, key thesis points, headline recommendation, and critical open items
2. **Commercial Analysis** — Market positioning, competitive dynamics, customer quality assessment, and growth sustainability evaluation
3. **Financial Analysis** — Revenue quality, retention metrics by segment, unit economics, and forward projections with supporting cohort data
4. **Legal and Structural Review** — Contract risk assessment, IP ownership validation, regulatory exposure, and governance considerations
5. **Open Issues and Risks** — Prioritized issue table with severity ratings, evidence citations, and recommended next steps
6. **Recommendation** — Investment stance with key conditions, valuation considerations, and proposed diligence workstreams for the next phase

Every claim in the memo includes an **evidence citation** linking to the specific source document or data point, with a clear label indicating whether the source is public or private. Confidence scores accompany quantitative findings, enabling IC members to quickly assess the reliability of each data point.

### Summary Deck (PPTX)

A 10-slide presentation designed for efficient IC review:

- **KPI summary boxes** — Headline metrics (ARR, NRR, GRR, customer count) presented in a scannable format
- **Issues table** — Severity-coded summary of all identified risks with status indicators
- **Two-column layouts** — Side-by-side comparison of management claims versus actual findings
- **Segment breakdowns** — Visual decomposition of performance across enterprise, mid-market, and SMB cohorts
- **Recommendation slide** — Clear investment stance with key conditions and next steps

### Interactive Dashboard

A real-time analytics interface accessible through the operator UI:

- **KPI cards** — Key performance indicators with trend indicators and segment-level drill-down
- **Revenue waterfall** — Visual bridge from beginning ARR through new, expansion, contraction, and churn to ending ARR
- **Customer concentration analysis** — Top customer revenue dependency with change-of-control risk flags
- **Filterable issues table** — All identified risks with sorting by severity, workstream, and status
- **Evidence panel** — Click-through access to underlying source documents with provenance labels

---

## Key Differentiators

### AI-First, Human-in-the-Loop

The agent does the analytical work — gathering data, running calculations, identifying patterns, and drafting deliverables. The analyst guides and approves: steering the agent's focus, reviewing findings, and authorizing sensitive actions like seller-facing questions. This model preserves human judgment where it matters most while eliminating the manual drudgery that consumes analyst time.

### Evidence-Based Analysis

Every finding, every claim, and every recommendation in the platform's output traces to a specific source. Public sources, private data room documents, and computed metrics are clearly labeled with provenance tags. Confidence scores quantify the strength of each finding, enabling analysts and IC members to quickly distinguish well-supported conclusions from areas requiring further diligence.

### Contradiction Detection

The synthesis agent systematically compares management's narrative against actual data from the private data room and public sources. This is not a simple keyword match — the agent understands that when a CIM claims "stable retention across all segments," it needs to verify that claim against segment-level retention data. When SMB gross retention has dropped from 85% to 78% while headline NRR remains stable at 112% due to enterprise expansion, the platform surfaces this as a material contradiction.

### Real-Time Observability

The operator UI provides complete visibility into the agent's work as it happens. Every tool call, every document review, every finding is visible in real time through the event stream. The trace inspector shows turn-by-turn agent reasoning, enabling analysts to understand not just what the agent found, but how it reached its conclusions. This transparency builds trust and enables analysts to intervene or redirect at any point.

### Institutional Consistency

The platform's methodology is encoded in reusable skill modules — not locked in individual analysts' heads. Every deal receives the same rigorous analytical framework: the same retention decomposition, the same concentration thresholds, the same contract risk checklist. This consistency eliminates the quality variance that plagues manual diligence and builds institutional knowledge that compounds across deals.

---

## Value Proposition

| Dimension | Manual Diligence | Agentic Diligence |
|-----------|-----------------|-------------------|
| **Speed** | 2-4 weeks for first-pass analysis | 3-5 minutes for comprehensive first pass |
| **Coverage** | Dependent on analyst thoroughness and time pressure | Systematic analysis of every document, every metric, every cross-reference |
| **Consistency** | Varies by analyst, by deal, by day | Standardized IC memo format and analytical methodology across all deals |
| **Scalability** | Linear headcount scaling — one deal per analyst | Parallel execution — run multiple deals simultaneously |
| **Auditability** | Scattered across email, Excel, and notes | Full event trail for every finding, every tool call, every decision |

### Speed

First-pass diligence completes in **3-5 minutes** versus the **2-4 weeks** typically required for manual analysis. This does not eliminate the need for human judgment and follow-up diligence, but it gives deal teams a comprehensive analytical foundation within hours of receiving data room access — not weeks.

### Coverage

The agent systematically reviews every document in the data room, cross-references every public claim against private data, and runs every standard financial analysis. There are no blind spots created by time pressure, fatigue, or analyst inexperience. If a change-of-control termination right is buried in the fifth appendix of a contract summary, the agent finds it.

### Consistency

Every deal produces the same structured output: a six-section investment memo, a 10-slide IC deck, and an interactive dashboard. The analytical methodology — retention decomposition, concentration analysis, revenue bridge reconciliation — is applied identically every time. IC members know exactly what to expect and where to find it.

### Scalability

Firms can run diligence on multiple targets simultaneously without proportionally increasing headcount. Each deal operates in an isolated session, enabling portfolio teams to maintain velocity across a full deal pipeline — particularly valuable during periods of high deal flow.

### Auditability

Every agent action is logged with timestamps, tool parameters, and results. The full event trail is preserved and searchable, creating a complete audit record of how each finding was discovered and what evidence supports it. This traceability is valuable not only during the deal process but for post-close integration planning and future reference.

---

## Integration and Deployment

### Infrastructure

The platform runs on **Microsoft Azure**, leveraging managed services for reliability, security, and scale:

- **Azure AI Foundry** — Enterprise-grade large language model hosting with the Azure OpenAI Service, providing the reasoning capabilities that power all agent workflows
- **Azure Blob Storage** — Secure storage for generated artifacts (PDF memos, PPTX decks) and session data
- **Azure SQL** — Persistent session storage enabling resumable diligence runs and cross-deal analytics

### Agent Orchestration

The platform is built on the **GitHub Copilot SDK**, providing enterprise-grade agent orchestration capabilities:

- **Multi-agent coordination** — Four specialist agents (commercial, financial, legal, synthesis) work in parallel with a central orchestrator
- **Tool approval tiers** — Graduated control from fully automated actions to human-approved sensitive operations
- **Session management** — Resumable sessions with structured identifiers for long-running diligence workflows
- **Streaming events** — Real-time event delivery to the operator UI via server-sent events

### Extensibility

The platform's architecture supports integration with production data sources:

- **Virtual Data Rooms** — Connect to Intralinks, Datasite, or other VDR platforms for direct document ingestion
- **Financial Data APIs** — Integrate with PitchBook, Capital IQ, or internal data warehouses for real-time market and financial data
- **News and Intelligence Feeds** — Connect to news APIs, regulatory databases, and industry-specific intelligence platforms
- **Internal Systems** — Integration points for CRM data, prior deal archives, and firm-specific diligence templates
