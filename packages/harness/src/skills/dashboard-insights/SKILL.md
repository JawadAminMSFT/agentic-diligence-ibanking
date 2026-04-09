---
name: dashboard-insights
description: Interactive data dashboard structure and KPI definitions for diligence review
---

# Diligence Dashboard Format

When generating an interactive dashboard using artifacts-generate_dashboard, provide structured data that enables stakeholders to explore key diligence findings interactively. The dashboard should surface the most decision-relevant data points.

## Dashboard Sections

### Section 1: KPI Summary Cards
Provide 6-8 headline metrics as card data:
- ARR (current)
- ARR Growth (YoY %)
- Net Revenue Retention (NRR)
- Gross Revenue Retention (GRR)
- Customer Count
- Gross Margin (%)
- Monthly Cash Burn
- Months of Runway

Each metric should include: value, trend direction (up/down/flat), benchmark comparison if available, and a risk flag (green/yellow/red).

### Section 2: Revenue Composition
Provide data for a stacked bar or waterfall chart:
- Beginning ARR
- New Business added
- Expansion revenue
- Contraction
- Churn
- Ending ARR
Include segment-level breakdown (Enterprise, Mid-Market, SMB or equivalent).

### Section 3: Retention Heatmap
Provide cohort data as a matrix:
- Rows: vintage cohorts (by quarter or year)
- Columns: months since acquisition (0, 3, 6, 12, 18, 24)
- Values: retention percentage
- Color code: green (>90%), yellow (80-90%), red (<80%)

### Section 4: Customer Concentration
Provide data for a Pareto chart:
- Top 1, 5, 10, 20 customers as % of total ARR
- Individual top-10 customer bars with ARR amounts
- Risk threshold line at 20%

### Section 5: Issue Tracker
Provide issue data as a sortable table:
- Issue ID, Title, Severity, Workstream, Status
- Color-coded severity indicators
- Filter/sort capability by severity and workstream

### Section 6: Public vs. Private Comparison
Provide comparison data as a two-column table:
- Metric name, Public Claim, Private Finding, Delta, Severity
- Highlight material discrepancies (>10% variance)

## Data Format Rules
- All monetary values in millions with one decimal: "$62.4M"
- Percentages with one decimal: "63.2%"
- Include the time period for each metric: "FY2024", "Q4 2024"
- Provide actual numeric values for charts, not just labels
- Include data source references for each metric
- Flag any metric where confidence is below 0.7
