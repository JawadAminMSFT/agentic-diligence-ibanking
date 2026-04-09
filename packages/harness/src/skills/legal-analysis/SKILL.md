---
name: legal-analysis
description: Legal due diligence analysis framework for M&A
---

# Legal Due Diligence

## Analysis Framework

### 1. Contract Transferability (Highest Priority)
For each of the top 10 customers by ARR:
- Does the contract have a change-of-control (CoC) clause?
- If yes: What are the terms? (termination right, renegotiation right, consent required?)
- What is the notice period? (30/60/90 days)
- **Quantify exposure**: Total ARR subject to CoC termination rights as % of total company ARR
- **Critical threshold**: If > 10% of ARR has CoC termination rights, flag as HIGH severity

### 2. Assignment and Consent Requirements
- Which contracts require counterparty consent for assignment?
- Are there anti-assignment provisions that could block the transaction structure?
- What is the risk of consent being withheld?

### 3. Liability and Indemnification
- Standard liability cap (typically 12 months of fees). Flag non-standard caps.
- Uncapped indemnification obligations (IP infringement, data breach, willful misconduct)
- Most Favored Nation (MFN) clauses that could be triggered by acquisition
- Non-standard warranty obligations

### 4. IP Ownership
- Confirm clean IP ownership: all employee/contractor IP assignment agreements in place
- Open-source license audit: any copyleft (GPL) contamination risk?
- Patent portfolio: offensive or defensive? Any pending IP litigation?
- Third-party IP dependencies: critical licensed technology

### 5. Employment and Key-Person Risk
- Key employee contracts: notice periods, non-competes, change-of-control acceleration
- Unvested equity: How much equity accelerates on CoC? (single vs. double trigger)
- Key-person dependency: What happens if the CTO/CEO leaves within 12 months?
- Open employment litigation or claims

### 6. Regulatory and Compliance
- SOC 2 Type II certification status
- GDPR/CCPA compliance: DPA agreements with customers
- Industry-specific regulations (HIPAA, PCI-DSS if applicable)
- Pending or historical regulatory actions

### Issue and Seller Question Rules
- Create workflow-create_issue for every finding rated Medium or above
- Use workflow-draft_seller_question (requires approval) for:
  - Missing IP assignment agreements
  - Unclear CoC terms in top contracts
  - Missing SOC 2 or compliance certifications

