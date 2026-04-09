---
name: evidence-rules
description: Provenance labeling, confidence scoring, cross-referencing, and evidence chain-of-custody rules
---

# Evidence Rules

## Provenance Labeling

Every piece of evidence must be tagged with exactly one provenance type. Provenance determines how much weight to assign a data point and whether it can stand alone or requires corroboration.

| Provenance Type      | Source                                  | Example                        | Standalone? |
|---------------------|-----------------------------------------|--------------------------------|-------------|
| `public_live`       | Publicly available data fetched live    | Web search results, SEC filings, press releases, Glassdoor, G2 | Yes — but verify publisher credibility |
| `synthetic_private` | Private data from the virtual data room | CIM, KPI workbook, contracts, customer lists, financial statements | Yes — but cross-reference against public sources |
| `derived`           | Computed or synthesised by agents       | Revenue bridges, cohort curves, memo sections | No — must cite underlying source evidence |
| `canonical_hidden`  | Reference data not shown to the model   | Scoring rubrics, internal benchmarks | N/A — not used in claims |

### Provenance Cross-Referencing Requirements
- **Management claims** (from CIM, management presentation): Must be validated against at least one independent source (public_live or independently computed derived data). Never take management claims at face value.
- **Financial metrics** (ARR, NRR, GRR, churn): Must be reconciled across at least two sources (e.g., CIM vs. KPI workbook vs. segment-level rebuild). Any gap > 5% between sources is flagged as an issue.
- **Market claims** (TAM, growth rate, market share): Must be validated against independent analyst reports (Forrester, Gartner, IDC). If no independent source is available, confidence is capped at 0.60.
- **Legal claims** (IP clean, no litigation, compliance status): Must be verified against VDR documents. Self-certification without supporting documentation is flagged as a gap.

## Confidence Scoring

Confidence scores range from 0.0 to 1.0 and must be assigned to every material finding in the memo:

| Score Range | Label | Criteria | Example |
|------------|-------|----------|---------|
| 0.90–1.00 | **High** | Multiple independent corroborating sources, no contradictions | ARR confirmed by KPI workbook, CIM, and audited financials |
| 0.70–0.84 | **Medium** | Single reliable source, or multiple sources with minor discrepancies | NRR from KPI workbook only; CIM states same figure but no independent validation |
| 0.50–0.69 | **Low** | Partially supported, material gaps or ambiguity | TAM claim from management presentation with no independent analyst validation |
| 0.30–0.49 | **Very Low** | Weak support, significant uncertainty, or single unverified source | Growth projection based on management forecast with no historical pattern support |
| 0.00–0.29 | **Unverified** | No supporting evidence found; claim requires seller clarification | IP ownership claimed verbally but no assignment agreements in VDR |

### Confidence Adjustment Rules
- **Contradiction detected**: Reduce confidence by 0.20 from the highest applicable score
- **Source is management-only** (CIM, mgmt presentation): Cap at 0.75 unless independently validated
- **Source is derived/computed**: Inherits the lowest confidence of its input evidence
- **Stale data** (>12 months old): Reduce confidence by 0.10

## Evidence Linking

### Claim → Evidence Chain
- Each claim must link to at least one evidence item via `evidenceIds`
- Each evidence item should link back to claims it supports via `linkedClaimIds`
- Contradictions must reference both conflicting evidence items and specify which is considered more reliable and why
- Memo sections must cite all evidence used via `evidenceIds`

### Cross-Source Validation Matrix
For key financial metrics, build a validation matrix:

| Metric | CIM Value | KPI Workbook | Segment Rebuild | Public Sources | Delta | Status |
|--------|-----------|-------------|-----------------|---------------|-------|--------|
| ARR    | $X        | $Y          | $Z              | $W            | ...   | ✓/✗    |

Any row where Status = ✗ (sources disagree by >5%) automatically generates an issue via workflow-create_issue.

### Evidence Sufficiency Rules
Before writing a memo section, verify evidence coverage:
- **Executive Summary**: Requires evidence from both public_live and synthetic_private provenance
- **Commercial**: Requires customer list data, at least one independent market source, and competitive positioning evidence
- **Financial**: Requires KPI data, revenue bridge, and cohort analysis. All three must be present.
- **Legal**: Requires executed contracts for top 5 customers. Missing contracts are flagged as HIGH severity gaps.
- **Recommendation**: Cannot be written until all HIGH severity issues have been documented
