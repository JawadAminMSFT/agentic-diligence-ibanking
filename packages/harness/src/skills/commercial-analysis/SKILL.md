---
name: commercial-analysis
description: Commercial due diligence analysis framework for M&A
---

# Commercial Due Diligence

## Analysis Framework

### 1. Market Assessment
- Validate TAM/SAM claims against independent sources (Gartner, Forrester, IDC)
- Assess market growth rate and cyclicality
- Identify secular tailwinds and headwinds
- Map competitive landscape: who are the top 3-5 competitors and what is their relative positioning?

### 2. Customer Analysis
Required data points to extract and validate:
- Total customer count by segment (Enterprise >$200K ACV, Mid-Market $50-200K, SMB <$50K)
- Revenue concentration: Top 1, Top 5, Top 10, Top 20 as % of total ARR
- **Critical threshold**: Flag if Top 5 customers > 20% of ARR as material concentration risk
- Customer vintage analysis: Are newer cohorts smaller or larger than older ones?
- Logo churn rate by segment and trend (improving or deteriorating?)

### 3. Competitive Positioning
- What is the company's claimed differentiation? Is it defensible?
- Switching costs: How hard is it for customers to leave? (integration depth, data lock-in, workflow dependency)
- Win/loss trends: Is the company winning against the same competitors as 2 years ago?
- Pricing power: Can the company raise prices without material churn?

### 4. Go-to-Market Efficiency
- Sales cycle length by segment
- CAC and CAC payback period trends
- Magic Number or sales efficiency ratio
- Channel mix: direct vs. partner vs. self-serve

### 5. Public-vs-Private Reconciliation
This is the most critical step. For each management claim:
- Find the public source (press release, blog, Glassdoor, industry report)
- Find the private corroboration or contradiction (CIM, KPI workbook, customer list)
- Document the delta with severity rating

### Issue Creation Rules
Create a workflow-create_issue for:
- Any customer concentration > 20% in top 5
- Any segment with logo churn > 15% annually
- Any material discrepancy between public claims and private data
- Missing competitive win/loss data
- Unvalidated TAM claims

