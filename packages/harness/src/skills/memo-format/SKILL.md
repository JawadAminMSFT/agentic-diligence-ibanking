---
name: memo-format
description: Investment Committee memo structure and formatting standards
---

# IC Memo Format

When writing investment memo sections using memo-write_section, follow these standards. Each section should be written as a standalone analytical document with specific data points, not generic summaries.

## Section: Executive Summary
Name: "Executive Summary"
Structure:
- **Opportunity overview**: Company name, sector, business model, key metric (ARR/revenue), growth rate. One paragraph.
- **Investment thesis**: 2-3 bullet points on why this asset is attractive
- **Key risks**: 2-3 bullet points on material risks identified, with quantification
- **Preliminary assessment**: One-line recommendation with confidence qualifier (e.g., "Proceed to Phase 2 with conditions" or "Elevated risk — requires management session before advancing")

## Section: Commercial
Name: "Commercial"
Structure:
- **Market position**: TAM, SAM, company's position, key competitors. Cite Forrester/Gartner/industry data.
- **Customer analysis**: Total customers, segment breakdown (Enterprise/Mid-Market/SMB), ACV by segment
- **Concentration risk**: Top 1/5/10 customer revenue concentration percentages. Flag if top 5 > 20% of revenue.
- **Competitive moat**: Product differentiation, switching costs, platform lock-in assessment
- **Go-to-market**: Sales motion (enterprise vs. self-serve), CAC trends, sales efficiency metrics
- **Public-private delta**: Material differences between public positioning and private data room findings

## Section: Financial
Name: "Financial"
Structure:
- **Revenue quality**: ARR vs. recognized revenue, subscription mix, one-time vs. recurring
- **Growth analysis**: YoY growth rate, organic vs. inorganic, new business vs. expansion vs. contraction breakdown via revenue bridge
- **Unit economics**: Blended and segment-level NRR, GRR, logo churn, revenue churn. Flag any segment where GRR < 85%
- **Cohort analysis**: Vintage retention curves by segment. Identify deteriorating cohorts.
- **Margin profile**: Gross margin, S&M as % of revenue, R&D as % of revenue, EBITDA margin trajectory
- **Cash flow and runway**: Monthly burn rate, cash position, months of runway at current burn. FCF trajectory.
- **Red flags**: Revenue bridge reconciliation gaps, metric inconsistencies between CIM and workbook, non-standard revenue recognition

## Section: Legal
Name: "Legal"
Structure:
- **Contract transferability**: Which key contracts have change-of-control provisions? Quantify ARR at risk.
- **Assignment restrictions**: Contracts requiring consent for assignment on acquisition
- **Liability and indemnification**: Non-standard liability caps, uncapped indemnities, MFN clauses
- **IP ownership**: Clean IP ownership confirmation or gaps. Open-source license risks.
- **Employment matters**: Key-person dependencies, non-compete enforceability, unvested equity at risk
- **Regulatory**: GDPR, SOC 2, industry-specific compliance status and gaps

## Section: Open Issues
Name: "Open Issues"
Structure: Table format with columns:
- Issue # | Title | Severity (High/Medium/Low) | Workstream | Description | Recommended Next Action
Sorted by severity descending. High = potential deal-breaker or >10% value impact. Medium = price adjustment or term negotiation. Low = tracking item.

## Section: Recommendation
Name: "Recommendation"
Structure:
- **Verdict**: Proceed / Proceed with conditions / Pass
- **Conditions** (if applicable): What must be resolved before advancing
- **Valuation considerations**: Risks that should be reflected in pricing
- **Suggested next steps**: Management meetings, expert calls, additional data requests

## Writing style
- Be specific: use numbers, percentages, dollar amounts — not "significant" or "material" without quantification
- Be direct: state the finding, then the evidence, then the implication
- Cite evidence: reference source documents (vdr-001, wr-001, etc.) and provenance (public_live / synthetic_private)
- Flag contradictions explicitly: "Management claims X (CIM p.12), but KPI data shows Y (vdr-004)"
- Confidence qualifiers: High confidence (multiple corroborating sources), Medium (single source), Low (inferred)
