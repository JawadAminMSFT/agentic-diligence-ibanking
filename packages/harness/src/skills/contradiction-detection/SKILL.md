---
name: contradiction-detection
description: Patterns, detection methods, and escalation rules for contradictions between diligence sources
---

# Contradiction Detection

## What Is a Contradiction?

A contradiction exists when two or more evidence items make claims that cannot both be true, or when a metric presented in one context is materially inconsistent with the same metric derived from underlying data. In buy-side diligence, contradictions are the single highest-signal indicator of risk — they reveal where management's narrative diverges from reality.

## Common Contradiction Patterns

### 1. Revenue Bridge Gaps
**Pattern**: CIM-reported ARR ≠ sum of segment-level ARR from the KPI workbook or customer list.
- Rebuild ARR bottom-up from the customer list (vdr-003) by summing segment totals
- Compare against CIM-stated ARR (vdr-001) and KPI workbook total
- **Trigger**: Flag if gap > $500K or > 2% of reported ARR
- **Root causes to investigate**: Reclassified usage revenue, timing of Q4 bookings, double-counted expansion ARR, inclusion of churned-but-not-yet-offboarded customers
- **Example**: "CIM states $62.4M ARR (vdr-001, p.4), but segment-level rebuild from customer list yields $60.4M (vdr-003) — a $2.0M gap (3.2%). Management has not provided a reconciliation."

### 2. Retention Masking
**Pattern**: Blended NRR/GRR looks healthy, but segment-level data reveals one or more segments in decay.
- Always decompose blended retention into Enterprise, Mid-Market, and SMB
- **Trigger**: Flag if any segment GRR < 85% while blended GRR > 90%
- **Why it matters**: Enterprise expansion (high NRR) can mask a collapsing SMB base for 2-3 quarters before the decay surfaces in blended metrics
- **Example**: "Blended GRR of 92% (vdr-001) masks SMB GRR of 74% (KPI workbook), which has declined from 85% over four quarters. Enterprise GRR of 97% is carrying the blended metric. At current trajectory, SMB segment contributes negative unit economics within 2 quarters."

### 3. Concentration Framing
**Pattern**: Management presents a large customer count to imply diversification, while revenue is concentrated in a small number of accounts.
- Calculate Top 1, Top 5, Top 10 as % of total ARR from the customer list
- Compare against how management frames concentration in the CIM
- **Trigger**: Flag if management cites total customer count without disclosing segment revenue distribution, especially if Top 5 > 20% of ARR
- **Example**: "CIM highlights '812 customers across three segments' (vdr-001, p.8) without disclosing that Top 5 represent 20.2% of ARR ($12.6M) and MegaMart alone is 6.7% ($4.2M) (vdr-003)."

### 4. Growth Rate Inflation
**Pattern**: Headline growth rate includes inorganic contributions (acquisitions) or one-time items not separated out.
- Compare stated growth rate against organic new business + expansion from the revenue bridge
- Check if any acquisitions closed during the measurement period
- **Trigger**: Flag if stated growth rate exceeds organic growth rate by > 5 percentage points
- **Example**: "CIM claims 63% YoY growth (vdr-001), but revenue bridge shows $4.2M from the Q2 AcmeTech tuck-in acquisition. Excluding inorganic contribution, organic growth is 52%."

### 5. Public-Private Divergence
**Pattern**: Public statements (press releases, investor communications, analyst reports) contain metrics that differ from private data room figures.
- For every key metric in the CIM, search for the same metric in public sources
- Compare: customer count, ARR, growth rate, NRR, employee count, funding amounts
- **Trigger**: Flag any divergence > 5% on financial metrics, or any qualitative contradiction
- **Example**: "TechCrunch article (wr-001) quotes CEO stating '812 enterprise customers' — but VDR customer list (vdr-003) shows 812 total customers across all segments, of which only 68 are Enterprise. The public framing materially overstates the enterprise base."

### 6. Contract vs. Narrative Conflicts
**Pattern**: Management claims about contract terms, customer satisfaction, or legal posture are contradicted by actual contract language or customer data.
- Compare CIM claims about contract flexibility, customer stickiness, or IP ownership against executed contracts in VDR
- **Trigger**: Flag any instance where CIM narrative is contradicted by contract terms
- **Example**: "CIM states 'minimal change-of-control exposure' (vdr-001, p.31), but executed contracts (vdr-005) show three of Top 5 customers have CoC termination rights covering $9.7M ARR (15.5% of total)."

### 7. Cohort Deterioration
**Pattern**: Management presents improving metrics on a blended basis while newer customer cohorts are performing worse than older ones.
- Compare Month-12 GRR across vintage cohorts (2022 vs. 2023 vs. 2024)
- **Trigger**: Flag if the most recent cohort's Month-12 GRR is > 5 percentage points below the oldest comparable cohort
- **Example**: "2022 SMB cohort Month-12 GRR was 85%; 2024 Q1 cohort is 74% — an 11-point deterioration. Management has not acknowledged this trend in the CIM."

## Detection Process

1. **Cross-provenance comparison** (most common): Compare public_live sources against synthetic_private for the same metric. Every material financial and commercial claim in the CIM should have an independent public check.
2. **Within-workstream reconciliation**: Rebuild key metrics from underlying data (e.g., sum segment ARR to check total ARR). The revenue bridge is the primary tool.
3. **Cross-workstream comparison**: Check that commercial claims (e.g., "low concentration") are consistent with financial evidence (actual customer ARR distribution) and legal evidence (contract terms).
4. **Temporal consistency**: Verify that historical claims still hold. A metric that was true 12 months ago may no longer be accurate.
5. **Narrative vs. data**: Read the CIM narrative, then check every quantitative claim against the underlying data room documents.

## Flagging Protocol

When a contradiction is detected:

1. Create a `Contradiction` record linking both claims and supporting evidence, specifying:
   - Source A (claim, document, page/section)
   - Source B (contradicting data, document, page/section)
   - Delta (quantified difference)
   - Materiality assessment
2. Create an `OpenIssue` via workflow-create_issue with severity:
   - **High**: Could affect deal valuation by >10%, trigger a walk-away, or represent potential fraud risk
   - **Medium**: Requires management clarification; may result in price adjustment or term negotiation
   - **Low**: Minor discrepancy (<$500K impact), likely explainable but worth documenting
3. Attempt resolution by seeking additional evidence from other sources
4. If unresolvable with available data, escalate to `severity: high` and draft a seller question via workflow-draft_seller_question
5. Never silently resolve — all resolutions must be documented with `resolvedBy` and the resolution rationale
