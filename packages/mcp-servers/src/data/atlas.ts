// ---------------------------------------------------------------------------
// Project Atlas — Supply-Chain SaaS
// Extracted from the original MCP server files (vdr, web-research, finance).
// ---------------------------------------------------------------------------

// ── VDR ────────────────────────────────────────────────────────────────────────

export interface VdrDocument {
  documentId: string;
  title: string;
  category: string;
  snippet: string;
  uploadedAt: string;
}

export const atlasVdrDocuments: VdrDocument[] = [
  {
    documentId: "vdr-001",
    title: "Project Atlas — Confidential Information Memorandum (CIM)",
    category: "Overview",
    snippet:
      "Comprehensive overview of Atlas Software: $62M ARR, 140% NRR, 800+ customers, supply-chain SaaS leader.",
    uploadedAt: "2025-01-05T14:00:00Z",
  },
  {
    documentId: "vdr-002",
    title: "Management Presentation — Q4 2024 Board Deck",
    category: "Management",
    snippet:
      "Board presentation covering Q4 results, 2025 plan, product roadmap, and headcount projections.",
    uploadedAt: "2025-01-06T10:30:00Z",
  },
  {
    documentId: "vdr-003",
    title: "Customer List & Revenue Breakdown — December 2024",
    category: "Commercial",
    snippet:
      "Full customer list with ARR by account, segment, contract dates, and renewal status. 812 active accounts.",
    uploadedAt: "2025-01-07T08:15:00Z",
  },
  {
    documentId: "vdr-004",
    title: "Monthly KPI Workbook — Trailing 12 Months",
    category: "Financial",
    snippet:
      "Detailed monthly metrics: ARR, MRR, NRR, gross retention, logo churn, CAC, LTV by segment.",
    uploadedAt: "2025-01-07T08:20:00Z",
  },
  {
    documentId: "vdr-005",
    title: "Key Customer Contracts — Summary of Terms",
    category: "Legal",
    snippet:
      "Summary of top 20 customer contracts including term, auto-renewal, termination rights, and pricing.",
    uploadedAt: "2025-01-07T09:00:00Z",
  },
  {
    documentId: "vdr-006",
    title: "Organization Chart & Key Personnel",
    category: "Management",
    snippet:
      "Current org chart showing executive team, department heads, and headcount by function (620 total).",
    uploadedAt: "2025-01-06T11:00:00Z",
  },
  {
    documentId: "vdr-007",
    title: "Capitalization Table — Fully Diluted",
    category: "Financial",
    snippet:
      "Cap table showing ownership breakdown across founders, investors, and ESOP after Series D.",
    uploadedAt: "2025-01-06T14:30:00Z",
  },
  {
    documentId: "vdr-008",
    title: "Technology Architecture & Infrastructure Overview",
    category: "Technology",
    snippet:
      "Technical architecture document covering cloud infrastructure, security certifications, and SLA history.",
    uploadedAt: "2025-01-08T16:00:00Z",
  },
  {
    documentId: "vdr-009",
    title: "Historical Financial Statements — FY2022–FY2024",
    category: "Financial",
    snippet:
      "Audited income statements, balance sheets, and cash flow statements for the last three fiscal years.",
    uploadedAt: "2025-01-08T16:30:00Z",
  },
];

export const atlasVdrContent: Record<string, string> = {
  "vdr-001": `# Project Atlas — Confidential Information Memorandum

**Prepared by: Moelis & Company | January 2025**

## Executive Summary

Atlas Software is a high-growth SaaS platform specializing in supply-chain orchestration for mid-market and enterprise customers. The Company has built a differentiated, cloud-native platform that enables real-time visibility, demand forecasting, and logistics automation.

### Key Investment Highlights

| Metric | Value |
|--------|-------|
| ARR (Dec 2024) | $62.4M |
| YoY ARR Growth | 63% |
| Net Revenue Retention | 140% |
| Gross Retention | 92% |
| Total Customers | 812 |
| Avg. Contract Value | $76,800 |
| Gross Margin | 74% |
| Rule of 40 Score | 51 |

### Growth Drivers
- **Land & Expand:** Customers typically start with one module and expand to 3+ within 18 months
- **Enterprise Momentum:** Added 28 enterprise logos (>$200K ACV) in 2024, up from 12 in 2023
- **Product Innovation:** Atlas Predict (AI forecasting) driving 40%+ attach rate on renewals

### Why Now
Atlas is at an inflection point — the company has product-market fit, a scalable go-to-market motion, and is poised to become the category leader. A strategic acquirer could accelerate international expansion and cross-sell into an existing customer base.

> **Note:** NRR of 140% is a blended figure across all segments. Segment-level NRR is available in the KPI workbook (vdr-004).`,

  "vdr-002": `# Management Presentation — Q4 2024 Board Deck

**Atlas Software | Confidential**

## Q4 2024 Results Summary

- **Ending ARR:** $62.4M (up from $58.1M in Q3)
- **Net New ARR:** $4.3M (Q4) vs. $4.8M (Q3) — slight deceleration
- **New Logos:** 38 (vs. 45 in Q3 — pipeline softening in SMB)
- **Logo Churn:** 22 customers (vs. 14 in Q3) — predominantly SMB
- **Enterprise Wins:** MegaMart ($1.2M ACV), FreshDirect ($420K), LogiCorp ($380K)

## 2025 Plan

- **ARR Target:** $95M (52% growth)
- **Headcount Plan:** Grow from 620 to 780 (+160 net new hires)
- **Key Initiatives:**
  1. Launch Atlas Predict GA (AI forecasting — currently beta)
  2. European expansion — target 15% of new bookings from EMEA
  3. Rebuild SMB self-serve experience (acknowledged Q3/Q4 degradation)
  4. SOC 2 Type II certification (expected Q2 2025)

## Risks Flagged by Management
- SMB churn trending upward — mitigation plan in progress
- VP Sales recently replaced (Marcus Rivera joined Sep 2024)
- Kafka infrastructure hitting scale limits; migration to Confluent Cloud planned
- CFO notes: burn rate increased to $3.2M/month; runway ~18 months at current rate

## Board Discussion Notes
The board expressed concern about SMB trajectory and asked management to provide a detailed SMB turnaround plan by February 2025. Director James Thornton asked whether the company should consider exiting SMB entirely to focus on enterprise.`,

  "vdr-003": `# Customer List & Revenue Breakdown — December 2024

## Summary Statistics
- **Total Active Customers:** 812
- **Total ARR:** $62.4M
- **Segments:** Enterprise (>$200K): 42 customers | Mid-Market ($50K–$200K): 185 customers | SMB (<$50K): 585 customers

## Top 10 Customers by ARR

| Rank | Customer | Segment | ARR | % of Total | Contract End | Auto-Renew |
|------|----------|---------|-----|------------|--------------|------------|
| 1 | MegaMart Inc. | Enterprise | $3,800,000 | 6.1% | Dec 2026 | Yes |
| 2 | RetailCo Group | Enterprise | $2,950,000 | 4.7% | Mar 2025 | Yes |
| 3 | GlobalShip Logistics | Enterprise | $2,400,000 | 3.8% | Jun 2026 | Yes |
| 4 | FreshDirect | Enterprise | $1,850,000 | 3.0% | Sep 2026 | Yes |
| 5 | Unilever NA | Enterprise | $1,600,000 | 2.6% | Dec 2025 | Yes |
| 6 | PharmaFlow Inc. | Enterprise | $1,200,000 | 1.9% | Nov 2025 | Yes |
| 7 | LogiCorp International | Enterprise | $980,000 | 1.6% | Jan 2027 | Yes |
| 8 | WholeFoods Supply | Enterprise | $870,000 | 1.4% | Aug 2025 | Yes |
| 9 | QuickDeliver Inc. | Mid-Market | $420,000 | 0.7% | Apr 2025 | No |
| 10 | Acme Distribution | Mid-Market | $380,000 | 0.6% | Jul 2025 | Yes |

## Concentration Analysis

| Metric | Value |
|--------|-------|
| Top 1 Customer | 6.1% of ARR |
| Top 5 Customers | 20.2% of ARR |
| Top 10 Customers | 26.4% of ARR |
| Top 20 Customers | 38.7% of ARR |

**⚠ Note:** RetailCo Group (2nd largest, $2.95M ARR) has a contract renewing in March 2025. The account has been flagged internally as "at risk" — their new VP of Supply Chain is evaluating competitive alternatives (Blue Yonder). Loss of this account would reduce NRR by approximately 5 percentage points.

## Segment Revenue Distribution
- Enterprise: $28.1M (45.0% of ARR) — 42 customers
- Mid-Market: $18.5M (29.6% of ARR) — 185 customers
- SMB: $15.8M (25.3% of ARR) — 585 customers

## SMB Churn Detail (Trailing 12 Months)
- SMB Logos Lost: 127 (out of 680 beginning-of-year)
- SMB ARR Churned: $4.1M
- SMB Gross Retention: 74%
- SMB NRR: 88%`,

  "vdr-004": `# Monthly KPI Workbook — Trailing 12 Months

## Blended Metrics (All Segments)

| Month | ARR ($M) | MRR Growth | NRR (TTM) | Gross Ret. (TTM) | Logo Churn | New Logos | Net New ARR ($M) |
|-------|----------|------------|-----------|-------------------|------------|-----------|------------------|
| Jan 2024 | 38.2 | 4.8% | 138% | 93% | 8 | 42 | 2.1 |
| Feb 2024 | 40.1 | 5.0% | 139% | 93% | 7 | 38 | 1.9 |
| Mar 2024 | 42.3 | 5.5% | 140% | 93% | 9 | 44 | 2.2 |
| Apr 2024 | 44.8 | 5.9% | 141% | 93% | 10 | 40 | 2.5 |
| May 2024 | 47.0 | 4.9% | 141% | 92% | 11 | 43 | 2.2 |
| Jun 2024 | 49.1 | 4.5% | 140% | 92% | 12 | 39 | 2.1 |
| Jul 2024 | 51.0 | 3.9% | 140% | 92% | 13 | 36 | 1.9 |
| Aug 2024 | 53.2 | 4.3% | 140% | 92% | 14 | 41 | 2.2 |
| Sep 2024 | 55.5 | 4.3% | 140% | 91% | 15 | 43 | 2.3 |
| Oct 2024 | 57.2 | 3.1% | 140% | 91% | 16 | 42 | 1.7 |
| Nov 2024 | 58.1 | 1.6% | 140% | 91% | 18 | 45 | 0.9 |
| Dec 2024 | 62.4 | 7.4% | 140% | 92% | 22 | 38 | 4.3 |

## Segment-Level NRR (TTM, as of December 2024)

| Segment | NRR | Gross Retention | Logo Count | ARR ($M) |
|---------|-----|-----------------|------------|----------|
| Enterprise | 165% | 98% | 42 | 28.1 |
| Mid-Market | 122% | 94% | 185 | 18.5 |
| SMB | 88% | 74% | 585 | 15.8 |

**⚠ Key Observation:** The blended NRR of 140% is heavily skewed by Enterprise expansion. SMB NRR has deteriorated from 102% (Jan 2024) to 88% (Dec 2024). SMB segment is now a net revenue detractor.

## SMB Monthly Gross Retention Trend

| Month | SMB Gross Ret. | SMB Logo Churn | SMB Logos |
|-------|---------------|----------------|-----------|
| Jan 2024 | 85% | 5 | 680 |
| Feb 2024 | 84% | 5 | 695 |
| Mar 2024 | 83% | 6 | 704 |
| Apr 2024 | 82% | 7 | 710 |
| May 2024 | 81% | 8 | 715 |
| Jun 2024 | 80% | 9 | 710 |
| Jul 2024 | 79% | 10 | 698 |
| Aug 2024 | 78% | 11 | 688 |
| Sep 2024 | 77% | 12 | 672 |
| Oct 2024 | 76% | 13 | 645 |
| Nov 2024 | 75% | 14 | 618 |
| Dec 2024 | 74% | 16 | 585 |

## Logo Churn Acceleration
Monthly logo churn has increased from 8 (Jan) to 22 (Dec). While the CIM presents a "92% gross retention" at the blended level, the SMB segment's 74% gross retention is significantly below SaaS benchmarks and masking the headline figure.`,

  "vdr-005": `# Key Customer Contracts — Summary of Terms

## Top 20 Contracts Summary

### 1. MegaMart Inc.
- **ACV:** $3,800,000
- **Term:** 3 years (Jan 2024 – Dec 2026)
- **Auto-Renewal:** Yes, 1-year periods with 90-day notice
- **Termination Rights:** Termination for convenience with 180-day notice and payment of remaining term
- **Change of Control:** **⚠ MegaMart has the right to terminate within 60 days of a change-of-control event without penalty**
- **Pricing:** Fixed for initial term; renewal subject to max 5% annual increase
- **Notes:** Largest customer. Contract negotiated directly with CEO.

### 2. RetailCo Group
- **ACV:** $2,950,000
- **Term:** 2 years (Apr 2023 – Mar 2025)
- **Auto-Renewal:** Yes, 1-year periods with 60-day notice
- **Termination Rights:** Termination for cause only
- **Change of Control:** **⚠ RetailCo has the right to terminate within 90 days of a change-of-control event without penalty**
- **Pricing:** Includes a most-favored-nation (MFN) clause — Atlas must offer RetailCo pricing no worse than any comparable customer
- **Notes:** Contract renewing Mar 2025. Account flagged as at-risk. MFN clause could limit pricing flexibility.

### 3. GlobalShip Logistics
- **ACV:** $2,400,000
- **Term:** 3 years (Jul 2024 – Jun 2027)
- **Auto-Renewal:** Yes
- **Termination Rights:** Standard mutual termination for material breach
- **Change of Control:** No change-of-control provision
- **Pricing:** Usage-based component (30% of ACV) tied to API call volume

### 4. FreshDirect
- **ACV:** $1,850,000
- **Term:** 2 years (Oct 2024 – Sep 2026)
- **Auto-Renewal:** Yes
- **Termination Rights:** Standard
- **Change of Control:** **⚠ FreshDirect may renegotiate terms within 120 days of change of control**
- **Pricing:** Fixed

### 5. Unilever NA
- **ACV:** $1,600,000
- **Term:** 3 years (Jan 2023 – Dec 2025)
- **Auto-Renewal:** Yes, with 120-day notice
- **Termination Rights:** Termination for convenience with 12-month notice
- **Change of Control:** No provision
- **Pricing:** Enterprise agreement with volume discounts

## Change-of-Control Summary

**⚠ MATERIAL FINDING:** Three of the top five customers (MegaMart, RetailCo, FreshDirect) representing approximately $8.6M ARR (13.8% of total) have change-of-control termination or renegotiation rights. In an acquisition scenario:
- MegaMart ($3.8M) — may terminate within 60 days
- RetailCo ($2.95M) — may terminate within 90 days
- FreshDirect ($1.85M) — may renegotiate within 120 days

This represents significant deal risk that should be addressed in the purchase agreement through representations, warranties, and potential earnout structures.

## Additional Contractual Notes
- 6 of the top 20 contracts contain MFN clauses
- 4 contracts have uncapped liability provisions (non-standard)
- 2 contracts (MegaMart, Unilever) include service-level credit provisions exceeding 15% of ACV`,

  "vdr-006": `# Organization Chart & Key Personnel

## Executive Team

| Name | Title | Tenure | Previous Role | Notes |
|------|-------|--------|---------------|-------|
| Maria Chen | CEO & Co-Founder | 7 years | VP Product, Oracle SCM | Founder; strong product background |
| James Okafor | CTO & Co-Founder | 7 years | Staff Engineer, Google Cloud | Founder; leads all engineering |
| David Lehmann | CFO | 1 year | CFO, Procore Technologies | Joined Jan 2024; cost-optimization focus |
| Sarah Kim | VP Engineering | 2 years | Director Eng, Datadog | Reports to CTO |
| Marcus Rivera | VP Sales | 4 months | VP Sales, Coupa Software | **Third VP Sales in 2 years** |
| Lisa Park | VP Customer Success | 3 years | Director CS, Zuora | Manages renewal & expansion |
| Tom Bradley | VP Product | 5 years | PM Lead, Salesforce | Long-tenured; reports to CEO |
| Nina Sharma | VP Marketing | 1.5 years | CMO, Series-B startup | Drives demand gen |
| Robert Cole | General Counsel | 2 years | Associate, Wilson Sonsini | First in-house counsel |

## Headcount by Function

| Function | Headcount | % of Total | YoY Change |
|----------|-----------|------------|------------|
| Engineering | 215 | 34.7% | +52 |
| Sales & BD | 142 | 22.9% | +68 |
| Customer Success | 88 | 14.2% | +15 |
| Product & Design | 62 | 10.0% | +18 |
| G&A (Finance, HR, Legal) | 55 | 8.9% | +22 |
| Marketing | 38 | 6.1% | +18 |
| Operations / IT | 20 | 3.2% | +17 |
| **Total** | **620** | **100%** | **+210** |

## Key Personnel Risks
- **VP Sales turnover:** Marcus Rivera is the third VP Sales in 24 months. Previous VPs (Jessica Tran, left Jun 2023; Andrew Mills, left Aug 2024) both cited disagreements with the CEO on go-to-market strategy.
- **CTO/Co-Founder:** James Okafor has a 4-year vesting schedule that fully vests in March 2025. No retention package has been negotiated for a post-acquisition scenario.
- **Engineering concentration:** 3 senior engineers ("the Kubernetes trio") are solely responsible for critical infrastructure. All three have vesting cliffs in Q2 2025.
- **Rapid G&A growth:** G&A headcount grew 67% YoY, outpacing revenue growth of 63%. CFO David Lehmann was brought in to address this.`,

  "vdr-007": `# Capitalization Table — Fully Diluted

## Post-Series D (March 2024)

| Shareholder | Shares | % Ownership (FD) | Investment | Preferred |
|-------------|--------|-------------------|------------|-----------|
| Maria Chen (CEO) | 12,500,000 | 15.6% | Founder | Common |
| James Okafor (CTO) | 10,000,000 | 12.5% | Founder | Common |
| Accel Partners | 14,400,000 | 18.0% | Series A, B, C | Series A/B/C Preferred |
| Bessemer Venture Partners | 11,200,000 | 14.0% | Series A, C | Series A/C Preferred |
| Summit Partners | 10,800,000 | 13.5% | Series D | Series D Preferred |
| ESOP (allocated) | 8,000,000 | 10.0% | — | Options |
| ESOP (unallocated) | 4,800,000 | 6.0% | — | Options |
| Other employees & advisors | 5,200,000 | 6.5% | — | Common/Options |
| Angel investors | 3,100,000 | 3.9% | Seed | Common |
| **Total (Fully Diluted)** | **80,000,000** | **100%** | | |

## Liquidation Preferences

| Series | Amount Invested | Preference | Participation |
|--------|----------------|------------|---------------|
| Series A | $8M | 1x non-participating | No |
| Series B | $22M | 1x non-participating | No |
| Series C | $45M | 1x non-participating | No |
| Series D | $85M | **1x participating, capped at 3x** | Yes |

**⚠ Note on Series D Terms:** Summit Partners negotiated a 1x participating preferred with a 3x cap. This means in a $620M exit (current valuation), Summit receives its $85M back plus participates pro-rata in the remaining proceeds up to a 3x cap ($255M). This could reduce common-stock payouts in exit scenarios below approximately $800M.

## ESOP Details
- Total ESOP pool: 12,800,000 shares (16.0% fully diluted)
- Allocated: 8,000,000 (10.0%) across ~280 employees
- Unallocated: 4,800,000 (6.0%)
- Standard vesting: 4-year vest, 1-year cliff
- Acceleration: No single-trigger acceleration. Double-trigger acceleration for VP+ level upon change of control + involuntary termination.`,

  "vdr-008": `# Technology Architecture & Infrastructure Overview

## Platform Architecture
Atlas runs a microservices architecture on Kubernetes (AWS EKS) across three regions:
- **US-East (primary):** 65% of compute, all core services
- **EU-West (Frankfurt):** 25% of compute, data residency for EU customers
- **APAC (Singapore):** 10% of compute, recently launched (Q3 2024)

## Technology Stack
- **Backend:** Go (60%), Rust (25%), Python (15% — ML services)
- **Frontend:** React, TypeScript, Next.js
- **Data:** PostgreSQL (primary), Apache Kafka (event streaming), Redis (caching), Snowflake (analytics)
- **Infrastructure:** Kubernetes (EKS), Terraform, ArgoCD, Datadog

## Security & Compliance
- SOC 2 Type I certified (achieved Q3 2023)
- SOC 2 Type II in progress (expected Q2 2025)
- GDPR compliant for EU data processing
- Annual penetration testing by NCC Group — most recent (Sep 2024) found 2 medium-severity and 0 critical vulnerabilities
- No known data breaches

## SLA Performance (Trailing 12 Months)
- **Uptime:** 99.97% (target: 99.95%)
- **p50 API latency:** 28ms
- **p99 API latency:** 94ms
- **Mean Time to Recovery (MTTR):** 18 minutes (3 incidents >15 min downtime in 2024)

## Technical Debt & Risks
- Kafka cluster approaching capacity limits (85% disk utilization in US-East); migration to Confluent Cloud planned for Q1 2025
- Legacy Rails monolith still handles billing and provisioning (~15% of requests); migration in progress but delayed due to resource constraints
- 3 engineers ("Kubernetes trio") hold sole knowledge of critical infrastructure orchestration layer — bus factor risk
- Test coverage: 68% overall (85% for Go services, 42% for legacy Rails)`,

  "vdr-009": `# Historical Financial Statements — FY2022–FY2024

## Income Statement Summary ($000s)

| Line Item | FY2022 | FY2023 | FY2024 |
|-----------|--------|--------|--------|
| **Revenue** | 18,200 | 34,500 | 58,800 |
| Cost of Revenue | (5,460) | (9,660) | (15,290) |
| **Gross Profit** | 12,740 | 24,840 | 43,510 |
| **Gross Margin** | 70.0% | 72.0% | 74.0% |
| Sales & Marketing | (8,190) | (15,180) | (28,220) |
| Research & Development | (7,280) | (12,420) | (19,990) |
| General & Administrative | (3,640) | (5,520) | (9,410) |
| **Total OpEx** | (19,110) | (33,120) | (57,620) |
| **Operating Income** | (6,370) | (8,280) | (14,110) |
| **Operating Margin** | -35.0% | -24.0% | -24.0% |
| Interest & Other | (120) | (310) | (580) |
| **Net Income** | (6,490) | (8,590) | (14,690) |

## Key Observations

**⚠ Revenue vs. ARR Discrepancy:** FY2024 recognized revenue is $58.8M while ending ARR is $62.4M. The gap is partially explained by ramp deals and mid-year bookings. However, approximately $2.1M of the difference comes from multi-year prepaid contracts that were recognized ratably — management should clarify how these contracts affect the reported ARR figure.

**⚠ S&M Expense Growth:** Sales & Marketing expense grew 86% YoY (vs. revenue growth of 70%), indicating worsening unit economics. CAC payback period has increased from 14 months (FY2023) to 19 months (FY2024).

**⚠ Burn Rate:** The company consumed $38.4M of cash in FY2024. With $57M cash remaining post-Series D, the company has approximately 18 months of runway at the current burn rate. This creates urgency for either a fundraise, profitability improvements, or a transaction.

## Balance Sheet Summary ($000s)

| Line Item | FY2022 | FY2023 | FY2024 |
|-----------|--------|--------|--------|
| Cash & Equivalents | 28,400 | 22,100 | 57,000 |
| Accounts Receivable | 3,200 | 6,100 | 11,400 |
| Total Current Assets | 32,800 | 29,900 | 71,200 |
| Total Assets | 38,200 | 37,400 | 82,600 |
| Deferred Revenue | 4,100 | 7,800 | 14,200 |
| Total Liabilities | 8,900 | 14,600 | 26,800 |
| Total Equity | 29,300 | 22,800 | 55,800 |

## Cash Flow Summary ($000s)

| Line Item | FY2022 | FY2023 | FY2024 |
|-----------|--------|--------|--------|
| Operating Cash Flow | (4,800) | (6,200) | (10,800) |
| Capex | (1,200) | (1,900) | (3,400) |
| Free Cash Flow | (6,000) | (8,100) | (14,200) |
| Financing Activities | 22,000 | 0 | 85,000 |`,
};

// ── Web Research ───────────────────────────────────────────────────────────────

export interface SearchResult {
  resultId: string;
  title: string;
  publisher: string;
  snippet: string;
  url: string;
  retrievedAt: string;
}

export const atlasSearchResults: SearchResult[] = [
  {
    resultId: "wr-001",
    title: "Atlas Software Raises $85M Series D to Accelerate Enterprise Expansion",
    publisher: "TechCrunch",
    snippet:
      "Atlas Software, the fast-growing SaaS platform for supply-chain orchestration, announced an $85M Series D round led by Summit Partners. The company claims 140% net revenue retention and over 800 enterprise customers.",
    url: "https://techcrunch.com/2024/03/15/atlas-software-series-d",
    retrievedAt: "2025-01-12T09:30:00Z",
  },
  {
    resultId: "wr-002",
    title: "Atlas Software Engineering Blog — Scaling to 10,000 Tenants on Kubernetes",
    publisher: "Atlas Engineering Blog",
    snippet:
      "In this post we discuss how Atlas re-architected its multi-tenant platform to serve over 10,000 tenants across three cloud regions while maintaining sub-100ms p99 latency.",
    url: "https://engineering.atlassoftware.io/scaling-10k-tenants",
    retrievedAt: "2025-01-12T09:31:00Z",
  },
  {
    resultId: "wr-003",
    title: "Atlas Software Reviews — 'Great product, growing pains in culture'",
    publisher: "Glassdoor",
    snippet:
      "Employees praise the technology and mission but note recent leadership turnover and aggressive sales targets. Several reviews mention a shift from product-led growth toward outbound enterprise sales causing internal friction.",
    url: "https://www.glassdoor.com/Reviews/Atlas-Software-Reviews-E987654.htm",
    retrievedAt: "2025-01-12T09:32:00Z",
  },
  {
    resultId: "wr-004",
    title: "Supply-Chain SaaS Market Map 2024 — Atlas Positioned as Leader",
    publisher: "Forrester Research",
    snippet:
      "Forrester's latest Wave report places Atlas Software in the Leaders quadrant for supply-chain orchestration platforms, citing strong product vision but noting customer concentration in the retail vertical.",
    url: "https://www.forrester.com/report/supply-chain-saas-wave-2024",
    retrievedAt: "2025-01-12T09:33:00Z",
  },
  {
    resultId: "wr-005",
    title: "Atlas Software | Company Profile & Key People",
    publisher: "LinkedIn",
    snippet:
      "Atlas Software — 620 employees, headquartered in Austin, TX. Founded 2017 by former Oracle supply-chain executives. Key people: CEO Maria Chen, CTO James Okafor, CFO David Lehmann (joined 2024).",
    url: "https://www.linkedin.com/company/atlas-software",
    retrievedAt: "2025-01-12T09:34:00Z",
  },
];

export const atlasPageContent: Record<string, string> = {
  "wr-001": `# Atlas Software Raises $85M Series D to Accelerate Enterprise Expansion

**Published: March 15, 2024 — TechCrunch**

Atlas Software, the Austin-based SaaS company specializing in supply-chain orchestration, has closed an $85 million Series D funding round led by Summit Partners with participation from existing investors Accel and Bessemer Venture Partners.

The company reports annual recurring revenue (ARR) of approximately $62 million, up from $38 million a year ago, representing roughly 63% year-over-year growth. CEO Maria Chen stated: "We're seeing massive demand from enterprise customers looking to modernize their supply-chain operations."

Atlas claims a net revenue retention (NRR) rate of 140% and serves over 800 customers across retail, manufacturing, and logistics. However, industry observers note that a significant portion of the company's revenue is concentrated in a handful of large retail accounts, which could present risks if any major customer churns.

The new funding will be used to expand the go-to-market team, invest in AI-driven forecasting features, and open a European headquarters in London.

**Valuation:** The round values Atlas at approximately $620 million post-money, roughly 10x forward ARR.`,

  "wr-002": `# Scaling to 10,000 Tenants on Kubernetes

**Atlas Engineering Blog — November 2, 2024**

By James Okafor, CTO

When Atlas started in 2017, we ran a simple monolithic Rails application. By 2022, we had outgrown that architecture. This post chronicles our journey to a Kubernetes-native, multi-tenant platform.

## Architecture Overview
- **Control Plane:** Centralized tenant management, billing, and provisioning
- **Data Plane:** Isolated compute and storage per tenant group using Kubernetes namespaces
- **Event Bus:** Apache Kafka for cross-service communication

## Key Metrics
- 10,000+ active tenants across 3 cloud regions (US-East, EU-West, APAC)
- Sub-100ms p99 API latency
- 99.97% uptime over the trailing 12 months

## Challenges
Our biggest challenge remains noisy-neighbor isolation. Despite namespace-level resource quotas, our largest customers (who represent ~35% of total compute) occasionally impact shared infrastructure. We are actively working on dedicated compute pools for our top-tier customers.

The re-architecture took 18 months and required temporarily pausing feature development, which contributed to some customer churn in our SMB segment during 2023.`,

  "wr-003": `# Atlas Software Reviews on Glassdoor

**Overall Rating: 3.6 / 5.0** (based on 187 reviews)

## Pros (common themes)
- "Cutting-edge technology stack — Kubernetes, Rust microservices, React frontend"
- "Strong product-market fit, customers love the platform"
- "Generous equity packages for early employees"
- "Remote-friendly culture with offices in Austin and New York"

## Cons (common themes)
- "VP of Sales was replaced twice in 18 months — strategy keeps changing"
- "Aggressive quota increases every quarter with no corresponding territory growth"
- "Engineering team stretched thin after the Kubernetes migration — lots of tech debt"
- "SMB customers feel neglected as company pivots toward enterprise"
- "New CFO (David Lehmann, joined Jan 2024) pushing hard on cost cuts — several beloved programs eliminated"

## Notable Review (Senior Account Executive, Dec 2024)
"The product sells itself to enterprise buyers, but our SMB book is hemorrhaging. We've lost 40+ SMB accounts in Q3 alone because the self-serve experience has degraded. Leadership doesn't seem worried because enterprise NRR masks it, but the logo churn is real."

## CEO Approval: 68% (down from 82% a year ago)`,

  "wr-004": `# Forrester Wave: Supply-Chain Orchestration Platforms, Q4 2024

**Atlas Software: Leader**

## Strengths
- Best-in-class API-first architecture enabling deep integration with ERPs
- Strong product vision for AI-driven demand forecasting
- High customer satisfaction scores (NPS 52) among enterprise accounts
- Rapid feature velocity — 14 major releases in 2024

## Cautions
- **Customer concentration:** Forrester estimates that Atlas's top 5 customers represent approximately 30-35% of total ARR. Loss of any single large account would materially impact growth metrics.
- **SMB segment weakness:** While enterprise metrics are strong, Atlas's SMB churn rate has increased from 1.8% monthly to 3.2% monthly over the past four quarters, suggesting the platform may be outgrowing its original SMB-focused positioning.
- **Geographic concentration:** ~85% of revenue comes from North America. The planned European expansion is early-stage with no significant bookings yet.

## Market Context
The supply-chain SaaS market is projected to reach $28B by 2027. Atlas competes primarily with Kinaxis, Blue Yonder, and o9 Solutions. Atlas differentiates through its modern cloud-native architecture and developer-friendly APIs.`,

  "wr-005": `# Atlas Software — Company Profile

**LinkedIn Company Page**

## Overview
- **Industry:** Software Development — Supply Chain & Logistics
- **Headquarters:** Austin, TX
- **Founded:** 2017
- **Employees:** 620 (up from 410 a year ago)
- **Specialties:** Supply-chain orchestration, demand forecasting, inventory optimization, logistics automation

## Key People
- **Maria Chen** — CEO & Co-Founder (prev. VP Product, Oracle SCM Cloud)
- **James Okafor** — CTO & Co-Founder (prev. Staff Engineer, Google Cloud)
- **David Lehmann** — CFO (joined Jan 2024, prev. CFO at Procore Technologies)
- **Sarah Kim** — VP Engineering (joined Mar 2023, prev. Director Eng at Datadog)
- **Marcus Rivera** — VP Sales (joined Sep 2024 — third VP Sales in 2 years)

## Recent Activity
- Opened London office (Q4 2024) with initial team of 15
- Launched "Atlas Predict" — AI forecasting module — at Supply Chain World conference
- Named to Forbes Cloud 100 for the second consecutive year

## Funding
- Series A: $8M (2019, Bessemer)
- Series B: $22M (2021, Accel)
- Series C: $45M (2022, Accel + Bessemer)
- Series D: $85M (2024, Summit Partners)
- **Total Raised:** $160M`,
};

// ── Finance ────────────────────────────────────────────────────────────────────

export const atlasKpis = {
  asOfDate: "2024-12-31",
  blended: {
    arr: 62_400_000,
    arrGrowthYoY: 0.63,
    nrr: 1.40,
    grossRetention: 0.92,
    totalCustomers: 812,
    avgContractValue: 76_800,
    mrrGrowthRate: 0.074,
    grossMargin: 0.74,
    ruleOf40: 51,
    ltv_cac: 3.2,
    cacPaybackMonths: 19,
    burnRateMonthly: 3_200_000,
    cashRemaining: 57_000_000,
    runwayMonths: 18,
  },
  segments: {
    enterprise: {
      arr: 28_100_000,
      nrr: 1.65,
      grossRetention: 0.98,
      customers: 42,
      avgContractValue: 669_048,
      logoChurnTrailing12m: 1,
    },
    midMarket: {
      arr: 18_500_000,
      nrr: 1.22,
      grossRetention: 0.94,
      customers: 185,
      avgContractValue: 100_000,
      logoChurnTrailing12m: 22,
    },
    smb: {
      arr: 15_800_000,
      nrr: 0.88,
      grossRetention: 0.74,
      customers: 585,
      avgContractValue: 27_009,
      logoChurnTrailing12m: 127,
    },
  },
  commentary: [
    "Blended NRR of 140% is heavily skewed by enterprise expansion revenue.",
    "SMB NRR has deteriorated from 102% (Jan 2024) to 88% (Dec 2024) — the segment is now a net revenue detractor.",
    "SMB gross retention of 74% is well below the SaaS benchmark of 85%+.",
    "CAC payback has increased from 14 months (FY2023) to 19 months (FY2024), indicating worsening unit economics.",
    "Burn rate of $3.2M/month leaves approximately 18 months of runway.",
  ],
};

export const atlasCohorts = {
  enterprise: [
    { cohortQuarter: "Q1 2023", month0: 100, month3: 99, month6: 99, month9: 98, month12: 98 },
    { cohortQuarter: "Q2 2023", month0: 100, month3: 100, month6: 99, month9: 99, month12: 98 },
    { cohortQuarter: "Q3 2023", month0: 100, month3: 99, month6: 99, month9: 99, month12: 99 },
    { cohortQuarter: "Q4 2023", month0: 100, month3: 100, month6: 100, month9: 99, month12: 99 },
    { cohortQuarter: "Q1 2024", month0: 100, month3: 100, month6: 99, month9: 99, month12: 98 },
    { cohortQuarter: "Q2 2024", month0: 100, month3: 99, month6: 99, month9: 99, month12: 98 },
  ],
  midMarket: [
    { cohortQuarter: "Q1 2023", month0: 100, month3: 97, month6: 95, month9: 93, month12: 91 },
    { cohortQuarter: "Q2 2023", month0: 100, month3: 97, month6: 95, month9: 94, month12: 92 },
    { cohortQuarter: "Q3 2023", month0: 100, month3: 97, month6: 95, month9: 93, month12: 91 },
    { cohortQuarter: "Q4 2023", month0: 100, month3: 96, month6: 94, month9: 93, month12: 91 },
    { cohortQuarter: "Q1 2024", month0: 100, month3: 96, month6: 94, month9: 92, month12: 90 },
    { cohortQuarter: "Q2 2024", month0: 100, month3: 96, month6: 93, month9: 91, month12: 89 },
  ],
  smb: [
    { cohortQuarter: "Q1 2023", month0: 100, month3: 93, month6: 87, month9: 82, month12: 78 },
    { cohortQuarter: "Q2 2023", month0: 100, month3: 92, month6: 85, month9: 80, month12: 76 },
    { cohortQuarter: "Q3 2023", month0: 100, month3: 91, month6: 83, month9: 77, month12: 73 },
    { cohortQuarter: "Q4 2023", month0: 100, month3: 90, month6: 81, month9: 74, month12: 69 },
    { cohortQuarter: "Q1 2024", month0: 100, month3: 88, month6: 78, month9: 70, month12: 64 },
    { cohortQuarter: "Q2 2024", month0: 100, month3: 86, month6: 75, month9: 66, month12: 59 },
  ],
};

export const atlasCohortCommentary: Record<string, string> = {
  enterprise:
    "Enterprise cohorts show exceptional stability — monthly logo retention is 98%+ across all cohorts. These customers have deep integrations and high switching costs.",
  midMarket:
    "Mid-market cohorts are stable but show slight degradation in recent vintages (Q1–Q2 2024), dropping to 89-90% 12-month retention vs. 91-92% historically.",
  smb:
    "⚠ SMB cohorts show severe and accelerating deterioration. The Q2 2024 cohort is on track for only 59% 12-month retention — nearly half the cohort will churn within a year. Each successive cohort is worse than the prior one, indicating a structural (not seasonal) problem.",
};

export const atlasRevenueBridge = {
  period: "FY2024 (Jan 2024 – Dec 2024)",
  beginningArr: 38_200_000,
  components: {
    newBusiness: 16_800_000,
    expansion: 15_900_000,
    contraction: -2_100_000,
    churn: -6_400_000,
  },
  endingArr: 62_400_000,
  derivedMetrics: {
    grossNewArr: 32_700_000,
    netNewArr: 24_200_000,
    grossRetention: 0.92,
    nrr: 1.40,
    impliedChurnRate: 0.168,
  },
  segmentBreakdown: {
    enterprise: {
      beginningArr: 14_200_000,
      newBusiness: 6_500_000,
      expansion: 8_100_000,
      contraction: -400_000,
      churn: -300_000,
      endingArr: 28_100_000,
    },
    midMarket: {
      beginningArr: 12_800_000,
      newBusiness: 5_800_000,
      expansion: 4_900_000,
      contraction: -900_000,
      churn: -2_100_000,
      endingArr: 20_500_000,
      note:
        "⚠ Ending ARR of $20.5M does not reconcile with the KPI workbook figure of $18.5M. The $2.0M gap may reflect mid-year segment reclassifications or timing differences. Recommend clarification from management.",
    },
    smb: {
      beginningArr: 11_200_000,
      newBusiness: 4_500_000,
      expansion: 2_900_000,
      contraction: -800_000,
      churn: -4_000_000,
      endingArr: 13_800_000,
      note:
        "⚠ Ending ARR of $13.8M does not reconcile with the KPI workbook figure of $15.8M. Combined with the mid-market discrepancy, total segment-level ending ARR sums to $62.4M, but the internal composition differs. This may indicate customers were reclassified between segments during the year.",
    },
  },
  qualityOfEarningsNotes: [
    "The CIM states gross retention of 92%, which matches the blended figure but conceals SMB gross retention of 74%.",
    "Churn of $6.4M represents 16.8% of beginning ARR — above the 10% threshold that typically raises diligence concerns.",
    "Expansion revenue of $15.9M is concentrated in enterprise (51% of total expansion), raising sustainability questions if enterprise NRR normalizes.",
    "Revenue bridge components do not perfectly reconcile with segment-level KPI workbook data — a $2.0M reclassification gap exists between mid-market and SMB segments.",
  ],
};
