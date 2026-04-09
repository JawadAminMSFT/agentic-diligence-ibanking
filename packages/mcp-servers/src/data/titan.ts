// ---------------------------------------------------------------------------
// Project Titan — Cloud-Native Endpoint Security Platform (Cybersecurity SaaS)
// ---------------------------------------------------------------------------

import type { VdrDocument, SearchResult } from "./atlas.js";

// ── VDR ────────────────────────────────────────────────────────────────────────

export const titanVdrDocuments: VdrDocument[] = [
  {
    documentId: "titan-vdr-001",
    title: "Project Titan — Confidential Information Memorandum (CIM)",
    category: "Overview",
    snippet:
      "Comprehensive overview of Titan Security: $45M ARR, 48% YoY growth, cloud-native endpoint detection & response platform serving enterprise and government.",
    uploadedAt: "2025-01-10T14:00:00Z",
  },
  {
    documentId: "titan-vdr-002",
    title: "Customer List & Revenue Breakdown — December 2024",
    category: "Commercial",
    snippet:
      "Full customer list with ARR by account, segment, contract type. Includes government (DoD, DHS) and enterprise accounts. 340 active customers.",
    uploadedAt: "2025-01-11T08:15:00Z",
  },
  {
    documentId: "titan-vdr-003",
    title: "Patent Portfolio Summary & Pending Litigation",
    category: "Legal",
    snippet:
      "Summary of 14 granted patents and 6 pending applications in behavioral threat detection. Includes status of ongoing patent dispute with CrowdShield Inc.",
    uploadedAt: "2025-01-11T09:00:00Z",
  },
  {
    documentId: "titan-vdr-004",
    title: "OEM Channel Agreement — NovaTech Systems",
    category: "Commercial",
    snippet:
      "Master OEM reseller agreement with NovaTech Systems covering bundled endpoint security for NovaTech's managed services platform. 30% of Titan revenue flows through this channel.",
    uploadedAt: "2025-01-11T10:30:00Z",
  },
  {
    documentId: "titan-vdr-005",
    title: "Organization Chart & Key Personnel",
    category: "Management",
    snippet:
      "Current org chart showing executive team, department heads, and headcount by function (285 total). Highlights key-person risk in core detection engine team.",
    uploadedAt: "2025-01-11T11:00:00Z",
  },
  {
    documentId: "titan-vdr-006",
    title: "Monthly KPI Workbook — Trailing 12 Months",
    category: "Financial",
    snippet:
      "Detailed monthly metrics: ARR, MRR, NRR, gross retention, logo churn, CAC, LTV by segment (enterprise, mid-market, government).",
    uploadedAt: "2025-01-12T08:00:00Z",
  },
];

export const titanVdrContent: Record<string, string> = {
  "titan-vdr-001": `# Project Titan — Confidential Information Memorandum

**Prepared by: Qatalyst Partners | January 2025**

## Executive Summary

Titan Security is a high-growth cybersecurity company offering a cloud-native endpoint detection and response (EDR) platform. Founded in 2019 by former NSA and Mandiant engineers, the Company has built a differentiated threat-detection engine that uses behavioral AI to identify zero-day exploits, fileless malware, and advanced persistent threats (APTs) in real time.

Titan serves a blue-chip customer base of enterprise organizations and U.S. federal government agencies, with a growing presence in financial services and critical infrastructure.

### Key Investment Highlights

| Metric | Value |
|--------|-------|
| ARR (Dec 2024) | $45.0M |
| YoY ARR Growth | 48% |
| Net Revenue Retention (Blended) | 128% |
| Gross Retention (Blended) | 91% |
| Total Customers | 340 |
| Avg. Contract Value | $132,350 |
| Gross Margin | 82% |
| Rule of 40 Score | 42 |

### Growth Drivers
- **Enterprise & Government:** 90%+ of ARR comes from enterprise (>$100K ACV) and government accounts, providing stable, high-value contracts
- **Platform Expansion:** Customers increasingly adopt the full Titan Suite (EDR + NDR + Cloud Workload Protection), driving 135% enterprise NRR
- **Regulatory Tailwinds:** Executive Order 14028 on cybersecurity and CMMC 2.0 requirements are driving mandatory adoption among defense contractors
- **OEM Channel:** Partnership with NovaTech Systems provides scaled distribution, contributing ~$13.5M ARR

### Why Now
The cybersecurity market is experiencing a generational shift toward cloud-native, AI-driven platforms. Titan is positioned to capture significant share from legacy vendors (Symantec, McAfee) as enterprises migrate to modern EDR. A strategic acquirer could leverage Titan's threat-intelligence IP and government certifications (FedRAMP High, ITAR-compliant environment) as competitive moats.

> **Note:** Blended NRR of 128% masks a significant divergence between enterprise (135%) and mid-market (105%). The OEM channel's contribution (30% of revenue) creates channel dependency risk that should be evaluated carefully.`,

  "titan-vdr-002": `# Customer List & Revenue Breakdown — December 2024

## Summary Statistics
- **Total Active Customers:** 340
- **Total ARR:** $45.0M
- **Segments:** Enterprise (>$100K ACV): 128 customers | Mid-Market ($25K–$100K): 162 customers | Government: 50 customers (agencies & defense contractors)

## Top 10 Customers by ARR

| Rank | Customer | Segment | ARR | % of Total | Contract End | Auto-Renew |
|------|----------|---------|-----|------------|--------------|------------|
| 1 | NovaTech Systems (OEM) | Channel | $13,500,000 | 30.0% | Dec 2025 | Yes |
| 2 | U.S. Dept. of Homeland Security | Government | $3,200,000 | 7.1% | Sep 2026 | No |
| 3 | JPMorgan Chase | Enterprise | $2,100,000 | 4.7% | Jun 2026 | Yes |
| 4 | Northrop Grumman | Government | $1,800,000 | 4.0% | Mar 2027 | Yes |
| 5 | Goldman Sachs | Enterprise | $1,450,000 | 3.2% | Dec 2025 | Yes |
| 6 | U.S. Cyber Command (via DISA) | Government | $1,200,000 | 2.7% | Sep 2025 | No |
| 7 | Raytheon Technologies | Government | $980,000 | 2.2% | Jun 2026 | Yes |
| 8 | Citibank | Enterprise | $920,000 | 2.0% | Mar 2026 | Yes |
| 9 | Lockheed Martin | Government | $870,000 | 1.9% | Dec 2026 | Yes |
| 10 | Deloitte | Enterprise | $780,000 | 1.7% | Aug 2025 | Yes |

## Concentration Analysis

| Metric | Value |
|--------|-------|
| Top 1 Customer (NovaTech OEM) | 30.0% of ARR |
| Top 5 Customers | 49.0% of ARR |
| Top 10 Customers | 59.5% of ARR |
| Government Sector (all) | 28.4% of ARR |

**⚠ CRITICAL FINDING — OEM Concentration:** NovaTech Systems accounts for $13.5M (30.0%) of total ARR through an OEM bundling arrangement. NovaTech embeds Titan's EDR agent within its managed security services platform and resells to ~2,400 end customers. Key risks:
- NovaTech contract expires December 2025 with 180-day non-renewal notice window
- NovaTech is actively evaluating building its own EDR capability (per industry sources)
- Loss of NovaTech would immediately reduce ARR by 30% and require replacing the entire channel
- NovaTech has MFN pricing — Titan cannot offer lower rates to direct enterprise customers than NovaTech's per-seat rate ($4.20/endpoint/month)

**⚠ Government Contract Restrictions:** Approximately $8.0M (17.8%) of ARR is derived from U.S. government contracts subject to ITAR (International Traffic in Arms Regulations) restrictions. Under ITAR:
- A change of control to a foreign acquirer would require DDTC (Directorate of Defense Trade Controls) approval
- Even a domestic acquisition may require novation of existing government contracts, a process that typically takes 6–12 months
- Certain classified programs (est. $1.8M ARR) may require CFIUS review

## Segment Revenue Distribution
- Enterprise: $17.6M (39.1% of ARR) — 128 customers
- Mid-Market: $5.9M (13.1% of ARR) — 162 customers
- Government: $8.0M (17.8% of ARR) — 50 customers
- OEM Channel (NovaTech): $13.5M (30.0% of ARR) — 1 partner (2,400+ end customers)`,

  "titan-vdr-003": `# Patent Portfolio Summary & Pending Litigation

## Patent Portfolio Overview

Titan Security holds 14 granted U.S. utility patents and has 6 additional applications pending. The portfolio covers core behavioral threat-detection algorithms, real-time kernel-level monitoring techniques, and cloud-native agent deployment architectures.

### Granted Patents (Selected)

| Patent No. | Title | Filed | Granted | Status |
|------------|-------|-------|---------|--------|
| US 11,234,567 | Behavioral Analysis Engine for Zero-Day Exploit Detection | Mar 2020 | Nov 2021 | Active |
| US 11,345,678 | Kernel-Level Fileless Malware Detection via Memory Forensics | Jun 2020 | Feb 2022 | Active |
| US 11,456,789 | Cloud-Native Agent Orchestration for Distributed Endpoint Fleets | Sep 2020 | Jul 2022 | Active |
| US 11,567,890 | Machine Learning Model for APT Attribution and Lateral Movement Detection | Jan 2021 | Dec 2022 | Active |
| US 11,678,901 | Real-Time Threat Intelligence Correlation Across Multi-Cloud Environments | Apr 2021 | May 2023 | Active |

### Pending Applications

| Application No. | Title | Filed | Status |
|-----------------|-------|-------|--------|
| US 18/123,456 | Autonomous Threat Remediation Using Reinforcement Learning | Aug 2023 | Office Action Pending |
| US 18/234,567 | Hardware-Accelerated Encryption Key Monitoring for Ransomware Prevention | Nov 2023 | Under Examination |
| US 18/345,678 | Federated Learning for Cross-Organization Threat Detection Without Data Sharing | Feb 2024 | Filed |

## Pending Litigation — CrowdShield Inc. v. Titan Security

**⚠ MATERIAL LEGAL RISK**

### Case Summary
On September 14, 2024, CrowdShield Inc. filed a patent infringement lawsuit against Titan Security in the U.S. District Court for the Eastern District of Texas (Case No. 6:24-cv-01287).

### Claims
CrowdShield alleges that Titan's behavioral analysis engine (covered by US 11,234,567 and US 11,345,678) infringes on three CrowdShield patents related to real-time behavioral endpoint analysis:
- CrowdShield US 10,987,654 — "System and Method for Real-Time Behavioral Endpoint Threat Scoring"
- CrowdShield US 10,876,543 — "Kernel Instrumentation for Fileless Attack Detection"
- CrowdShield US 10,765,432 — "Cloud-Orchestrated Endpoint Response Automation"

### Relief Sought
CrowdShield seeks:
1. Injunctive relief (cease use of infringing technology)
2. Treble damages for willful infringement (estimated $40M–$80M based on Titan's revenue)
3. Ongoing royalties of 5–8% of Titan's EDR-related revenue

### Titan's Position
Titan's outside counsel (Kirkland & Ellis) has filed a response asserting:
- Non-infringement: Titan's architecture is fundamentally different from CrowdShield's approach
- Invalidity: Prior art from academic publications (MIT CSAIL, 2018) anticipates CrowdShield's claims
- The Eastern District of Texas venue is being challenged via motion to transfer to Northern District of California

### Risk Assessment
- **Probability of Adverse Outcome:** Outside counsel estimates 25–35% probability of partial adverse finding
- **Potential Financial Exposure:** $15M–$45M (damages) + potential injunction requiring code modifications
- **Timeline:** Discovery phase through Q2 2025; trial unlikely before Q4 2025
- **Impact on Transaction:** An acquirer would need to assume this litigation risk. Indemnification provisions and escrow holdbacks should be negotiated.

### IP Assignment Note
All patents are currently assigned to Titan Security, Inc. (the operating entity). However, **patents US 11,234,567 and US 11,345,678 were originally filed under the names of individual inventors (Dr. Andrei Volkov and Dr. Priya Nair) and assigned to Titan via employment invention assignment agreements.** These assignments should be independently verified as part of IP diligence.`,

  "titan-vdr-004": `# OEM Channel Agreement — NovaTech Systems

## Agreement Summary

**Parties:** Titan Security, Inc. ("Titan") and NovaTech Systems Corp. ("NovaTech")
**Effective Date:** January 1, 2023
**Term:** 3 years (through December 31, 2025), with automatic 1-year renewals unless either party provides 180-day written non-renewal notice
**Agreement Type:** Exclusive OEM Reseller Agreement for Managed Security Services

## Commercial Terms

### Revenue Structure
- NovaTech pays Titan a per-endpoint license fee of $4.20/endpoint/month
- Current deployed base: ~268,000 endpoints across NovaTech's managed services customers
- Annual revenue to Titan: approximately $13.5M (30% of total ARR)
- NovaTech retains approximately 55% margin on the bundled offering to end customers

### Exclusivity Provisions
- **⚠ Exclusive Territory:** NovaTech has exclusive rights to resell Titan's EDR technology to managed services customers with fewer than 5,000 endpoints
- **⚠ Non-Compete:** Titan may not partner with any other managed security services provider (MSSP) in North America during the term + 12 months post-termination
- **Direct Sales Carve-Out:** Titan retains the right to sell directly to enterprise accounts with 5,000+ endpoints and to government entities

### Most-Favored-Nation (MFN) Clause
- **⚠ MFN Pricing:** Titan may not offer any customer (direct or channel) a per-endpoint rate lower than the rate charged to NovaTech ($4.20/endpoint/month)
- This effectively sets a pricing floor across Titan's entire business
- The MFN applies to the base EDR product only; add-on modules (NDR, Cloud Workload Protection) are not covered

### Change-of-Control Provision
- **⚠ MATERIAL:** In the event of a change of control of Titan (defined as >50% ownership change, merger, or asset sale), NovaTech has the right to:
  1. Terminate the agreement with 90-day notice
  2. Receive a perpetual, royalty-free license to the then-current version of Titan's EDR agent software
  3. Receive 12 months of transition support at no additional cost
- This provision effectively gives NovaTech a free perpetual license to Titan's core technology in an acquisition scenario

### Performance Obligations
- NovaTech committed to a minimum of 200,000 deployed endpoints by end of Year 2 (achieved: 268,000)
- Titan must maintain 99.95% uptime SLA and provide dedicated support team (currently 8 FTEs)
- Titan bears all costs of agent updates, threat intelligence feeds, and false-positive resolution

## Risk Assessment for Transaction

**⚠ KEY DILIGENCE FINDINGS:**

1. **Revenue Concentration:** $13.5M (30%) of ARR flows through a single channel partner whose contract expires in 11 months
2. **Perpetual License Trigger:** A change-of-control event triggers NovaTech's right to a perpetual, royalty-free license to Titan's core EDR agent — effectively transferring significant IP value at zero cost
3. **Non-Compete Restriction:** The 12-month post-termination non-compete with MSSPs limits go-to-market flexibility
4. **MFN Floor:** The $4.20/endpoint/month floor constrains Titan's ability to compete on price in the direct enterprise market
5. **Build vs. Buy Risk:** Industry sources indicate NovaTech's 2025 roadmap includes investment in proprietary endpoint detection capabilities, suggesting NovaTech may not renew regardless of change-of-control

**Recommendation:** Negotiate NovaTech contract amendment prior to closing. The perpetual license provision, in particular, could materially erode the value of the acquired IP portfolio.`,

  "titan-vdr-005": `# Organization Chart & Key Personnel

## Executive Team

| Name | Title | Tenure | Previous Role | Notes |
|------|-------|--------|---------------|-------|
| Viktor Petrov | CEO & Co-Founder | 5 years | Director, NSA TAO | Founder; deep government relationships |
| Dr. Andrei Volkov | CTO & Co-Founder | 5 years | Principal Engineer, Mandiant | Founder; architect of detection engine |
| Rachel Torres | CFO | 2 years | VP Finance, Zscaler | Strong SaaS financial operations |
| Michael Chang | VP Engineering | 3 years | Engineering Manager, CrowdStrike | Manages 110-person engineering org |
| Karen Liu | VP Sales | 1.5 years | RVP Enterprise, Palo Alto Networks | Leads direct enterprise & government sales |
| James Whitfield | VP Government Programs | 4 years | Contracting Officer, U.S. Air Force | Manages all federal relationships and ITAR compliance |
| Dr. Priya Nair | Principal Scientist | 5 years | Research Scientist, MIT CSAIL | **Key person — core detection engine co-inventor** |

## Headcount by Function

| Function | Headcount | % of Total | YoY Change |
|----------|-----------|------------|------------|
| Engineering (R&D) | 110 | 38.6% | +28 |
| Sales & BD | 62 | 21.8% | +18 |
| Customer Success & Support | 38 | 13.3% | +8 |
| Threat Intelligence & Research | 25 | 8.8% | +7 |
| G&A (Finance, HR, Legal) | 22 | 7.7% | +5 |
| Marketing | 16 | 5.6% | +4 |
| Government Programs & Compliance | 12 | 4.2% | +3 |
| **Total** | **285** | **100%** | **+73** |

## Key Personnel Risks

### ⚠ Core Detection Engine Team — Critical Concentration Risk

The behavioral threat-detection engine — Titan's primary competitive differentiator and the technology covered by 8 of 14 granted patents — was designed and built primarily by three individuals:

1. **Dr. Andrei Volkov** (CTO) — Architect of the kernel-level instrumentation layer and behavioral scoring model. Named inventor on 11 of 14 patents.
2. **Dr. Priya Nair** (Principal Scientist) — Designed the ML pipeline for zero-day detection. Named inventor on 9 of 14 patents. Co-inventor on the two patents being challenged in the CrowdShield litigation.
3. **Sergei Kozlov** (Staff Engineer) — Sole maintainer of the cloud orchestration layer and agent deployment infrastructure. Only person who fully understands the proprietary agent update mechanism used across 300,000+ endpoints.

**⚠ Retention Risk:**
- Dr. Volkov's 4-year vesting schedule completes in June 2025. No post-vesting retention package has been executed.
- Dr. Nair received an external offer from Google DeepMind (threat intelligence division) in November 2024. She was retained with a $400K spot bonus and additional equity grant, but no long-term commitment beyond December 2025.
- Sergei Kozlov has expressed frustration with compensation (below market for his role) and has been interviewing externally as of Q4 2024.

**If any two of these three individuals depart, Titan's ability to maintain and evolve its core detection engine would be severely impaired.** The knowledge transfer documentation for the detection engine is minimal — estimated at 15% coverage of critical subsystems.

### Additional Personnel Notes
- **VP Sales (Karen Liu):** Only 18 months tenure. Enterprise pipeline is strong but government pipeline is still managed informally by CEO (Viktor Petrov) through personal relationships.
- **VP Government Programs (James Whitfield):** Holds the personal relationships with DoD contracting officers that are essential for government renewals. His departure would put $8M+ government ARR at risk.
- **R&D Spending:** Engineering headcount (110) represents 38.6% of total company and R&D expense runs at 45% of revenue — significantly above the cybersecurity SaaS median of 25–30%.`,

  "titan-vdr-006": `# Monthly KPI Workbook — Trailing 12 Months

## Blended Metrics (All Segments)

| Month | ARR ($M) | MRR Growth | NRR (TTM) | Gross Ret. (TTM) | Logo Churn | New Logos | Net New ARR ($M) |
|-------|----------|------------|-----------|-------------------|------------|-----------|------------------|
| Jan 2024 | 30.4 | 4.2% | 126% | 92% | 2 | 14 | 1.3 |
| Feb 2024 | 31.5 | 3.6% | 126% | 92% | 3 | 12 | 1.1 |
| Mar 2024 | 33.0 | 4.8% | 127% | 91% | 2 | 16 | 1.5 |
| Apr 2024 | 34.2 | 3.6% | 127% | 91% | 3 | 13 | 1.2 |
| May 2024 | 35.6 | 4.1% | 127% | 91% | 4 | 15 | 1.4 |
| Jun 2024 | 37.1 | 4.2% | 128% | 91% | 3 | 14 | 1.5 |
| Jul 2024 | 38.4 | 3.5% | 128% | 91% | 4 | 11 | 1.3 |
| Aug 2024 | 39.8 | 3.6% | 128% | 91% | 3 | 13 | 1.4 |
| Sep 2024 | 41.0 | 3.0% | 128% | 91% | 5 | 12 | 1.2 |
| Oct 2024 | 42.3 | 3.2% | 128% | 91% | 4 | 14 | 1.3 |
| Nov 2024 | 43.5 | 2.8% | 128% | 91% | 5 | 11 | 1.2 |
| Dec 2024 | 45.0 | 3.4% | 128% | 91% | 4 | 15 | 1.5 |

## Segment-Level NRR (TTM, as of December 2024)

| Segment | NRR | Gross Retention | Logo Count | ARR ($M) |
|---------|-----|-----------------|------------|----------|
| Enterprise | 135% | 94% | 128 | 17.6 |
| Mid-Market | 105% | 82% | 162 | 5.9 |
| Government | 122% | 97% | 50 | 8.0 |
| OEM (NovaTech) | 118% | 100% | 1 | 13.5 |

**⚠ Key Observation — Mid-Market Weakness:** Mid-market gross retention of 82% is below the cybersecurity SaaS benchmark of 90%+. Mid-market customers frequently cite competitive pressure from SentinelOne and Microsoft Defender for Endpoint, which offer similar functionality at 40–60% lower price points. Mid-market NRR of 105% indicates minimal expansion within this segment.

**⚠ Key Observation — OEM Dependency:** NovaTech OEM channel shows 118% NRR driven by endpoint growth in NovaTech's customer base, but this growth is entirely outside Titan's control. NovaTech's contract renewal decision in 2025 will determine whether this $13.5M revenue stream continues.

## Government Contract Renewal Schedule

| Agency / Contractor | ARR ($M) | Contract End | Renewal Type | ITAR Restricted |
|---------------------|----------|--------------|--------------|-----------------|
| DHS CISA | 3.2 | Sep 2026 | Competitive re-bid | No |
| U.S. Cyber Command (DISA) | 1.2 | Sep 2025 | Sole-source option | Yes |
| Northrop Grumman | 1.8 | Mar 2027 | Auto-renew | Yes (subcontract) |
| Raytheon Technologies | 0.98 | Jun 2026 | Auto-renew | Yes (subcontract) |
| Lockheed Martin | 0.87 | Dec 2026 | Auto-renew | Yes (subcontract) |

**⚠ ITAR Note:** Approximately $4.85M of government-related ARR is subject to ITAR restrictions. Change-of-control to a foreign entity would trigger mandatory DDTC notification and could result in contract termination or novation requirements.`,
};

// ── Web Research ───────────────────────────────────────────────────────────────

export const titanSearchResults: SearchResult[] = [
  {
    resultId: "titan-wr-001",
    title: "Titan Security Raises $32M Series C to Expand Federal Cybersecurity Platform",
    publisher: "TechCrunch",
    snippet:
      "Titan Security, the cloud-native endpoint security startup, closed a $32M Series C led by Insight Partners. The company reports $45M ARR and has secured FedRAMP High authorization, opening the door to expanded federal contracts.",
    url: "https://techcrunch.com/2024/06/20/titan-security-series-c",
    retrievedAt: "2025-01-15T10:00:00Z",
  },
  {
    resultId: "titan-wr-002",
    title: "Gartner Magic Quadrant for Endpoint Protection Platforms 2024 — Titan Enters as Visionary",
    publisher: "Gartner",
    snippet:
      "Gartner placed Titan Security in the Visionaries quadrant, citing innovative behavioral AI capabilities but noting limited geographic presence outside North America and reliance on a single OEM channel partner for distribution scale.",
    url: "https://www.gartner.com/doc/reprints?id=1-2F4GHIJK&ct=240815",
    retrievedAt: "2025-01-15T10:01:00Z",
  },
  {
    resultId: "titan-wr-003",
    title: "CrowdShield Files Patent Infringement Suit Against Titan Security",
    publisher: "Law360",
    snippet:
      "CrowdShield Inc. filed a patent infringement lawsuit against Titan Security in the Eastern District of Texas, alleging that Titan's behavioral endpoint analysis engine violates three CrowdShield patents. CrowdShield seeks treble damages estimated at $40M–$80M.",
    url: "https://www.law360.com/articles/1847293/crowdshield-sues-titan-over-endpoint-detection-patents",
    retrievedAt: "2025-01-15T10:02:00Z",
  },
  {
    resultId: "titan-wr-004",
    title: "CISO Roundtable: Why We Chose Titan Over CrowdStrike",
    publisher: "Dark Reading",
    snippet:
      "Three enterprise CISOs share why they selected Titan Security for endpoint protection. Key factors: superior zero-day detection rates in MITRE ATT&CK evaluations, FedRAMP authorization, and willingness to deploy on-premises for regulated environments.",
    url: "https://www.darkreading.com/endpoint-security/ciso-roundtable-titan-vs-crowdstrike",
    retrievedAt: "2025-01-15T10:03:00Z",
  },
  {
    resultId: "titan-wr-005",
    title: "NovaTech Systems 2025 Strategy: Building In-House Security Capabilities",
    publisher: "CRN",
    snippet:
      "NovaTech Systems, one of the largest managed security service providers, announced plans to invest $50M in building proprietary endpoint detection capabilities, raising questions about the future of its OEM partnerships with vendors like Titan Security.",
    url: "https://www.crn.com/news/security/novatech-in-house-security-2025",
    retrievedAt: "2025-01-15T10:04:00Z",
  },
];

export const titanPageContent: Record<string, string> = {
  "titan-wr-001": `# Titan Security Raises $32M Series C to Expand Federal Cybersecurity Platform

**Published: June 20, 2024 — TechCrunch**

Titan Security, the cloud-native endpoint detection and response (EDR) startup founded by former NSA and Mandiant engineers, has closed a $32 million Series C funding round led by Insight Partners, with participation from existing investors Greylock Partners and In-Q-Tel (the CIA's venture capital arm).

The company reports annual recurring revenue (ARR) of approximately $45 million, growing 48% year-over-year. CEO Viktor Petrov told TechCrunch: "The cybersecurity landscape is shifting rapidly. Legacy endpoint solutions can't keep up with AI-generated malware and fileless attacks. Our behavioral detection engine catches threats that signature-based tools miss entirely."

Titan achieved FedRAMP High authorization in March 2024, a milestone that took 14 months and required significant investment in compliance infrastructure. The authorization enables Titan to serve civilian and defense agencies processing high-impact data. The company already counts the Department of Homeland Security and U.S. Cyber Command among its customers.

However, the company's growth story has complications. Approximately 30% of Titan's revenue ($13.5M) flows through a single OEM channel partner, NovaTech Systems, which bundles Titan's EDR agent into its managed security services. Industry sources indicate NovaTech may be developing competing capabilities, potentially threatening this revenue stream.

Additionally, Titan is currently defending a patent infringement lawsuit filed by CrowdShield Inc., a well-funded competitor backed by SoftBank. The suit alleges that Titan's core behavioral analysis engine infringes on three CrowdShield patents.

**Valuation:** The Series C values Titan at approximately $350 million post-money, representing roughly 7.8x forward ARR.

**Investors:**
- Series A: $8M (2021, Greylock Partners)
- Series B: $18M (2022, Greylock + In-Q-Tel)
- Series C: $32M (2024, Insight Partners)
- Total Raised: $58M`,

  "titan-wr-002": `# Gartner Magic Quadrant for Endpoint Protection Platforms, 2024

**Titan Security: Visionary**

## Strengths
- Best-in-class behavioral AI detection engine — achieved highest zero-day detection rate (98.7%) in independent MITRE ATT&CK Evaluations (Round 6)
- FedRAMP High authorization gives access to lucrative federal cybersecurity market
- Strong customer satisfaction: NPS of 62 among enterprise accounts; 71 among government accounts
- Innovative cloud-native architecture allows deployment in air-gapped, hybrid, and multi-cloud environments
- Kernel-level instrumentation provides deeper visibility than competitors relying on user-mode hooks

## Cautions
- **OEM channel dependency:** Approximately 30% of Titan's revenue flows through a single OEM partner (NovaTech Systems). Gartner clients should assess the sustainability of this arrangement before committing to Titan.
- **Limited geographic presence:** 95% of Titan's revenue is North American. No significant European or APAC operations exist, which limits appeal for global enterprises.
- **Patent litigation risk:** Ongoing patent dispute with CrowdShield could result in injunctive relief or mandatory technology modifications if resolved adversely.
- **Key-person risk:** Gartner's reference calls indicated concerns about knowledge concentration in Titan's core detection engine team, with only three engineers maintaining deep expertise in the behavioral analysis subsystem.
- **Mid-market competitive positioning:** Titan's per-endpoint pricing ($6–$8/endpoint/month for direct customers) is 40–60% higher than Microsoft Defender for Endpoint and SentinelOne in the mid-market segment, resulting in weak mid-market retention.

## Market Context
The endpoint protection platform market reached $16.8B in 2024 and is projected to grow to $28B by 2028. Key competitors include CrowdStrike, SentinelOne, Microsoft, Palo Alto Networks (Cortex XDR), and Trend Micro. Titan differentiates through its government certifications and behavioral AI capabilities but faces pricing pressure in the mid-market from platform vendors bundling security into broader offerings.`,

  "titan-wr-003": `# CrowdShield Files Patent Infringement Suit Against Titan Security

**Published: September 16, 2024 — Law360**

CrowdShield Inc., the SoftBank-backed cybersecurity company, has filed a patent infringement lawsuit against rival Titan Security in the U.S. District Court for the Eastern District of Texas.

## The Dispute

CrowdShield alleges that Titan's behavioral endpoint analysis engine — the core technology powering its EDR platform — infringes on three CrowdShield patents:

1. **US 10,987,654** — "System and Method for Real-Time Behavioral Endpoint Threat Scoring" (granted August 2021)
2. **US 10,876,543** — "Kernel Instrumentation for Fileless Attack Detection" (granted December 2021)
3. **US 10,765,432** — "Cloud-Orchestrated Endpoint Response Automation" (granted March 2022)

CrowdShield CEO Dmitri Kovalenko stated: "We invested years and hundreds of millions of dollars developing these technologies. Titan's founders came from the intelligence community and adapted publicly available academic research into a commercial product that directly copies our patented approach."

## Titan's Response

Titan Security issued a statement calling the lawsuit "baseless and anticompetitive." Titan's general counsel noted that the company's technology was independently developed by its founding team prior to CrowdShield's patent filings and that significant prior art exists in academic literature.

Legal experts note that the Eastern District of Texas is historically favorable to patent plaintiffs, though recent reforms have somewhat rebalanced outcomes.

## Financial Implications

If CrowdShield prevails, the financial impact could be significant:
- **Damages:** CrowdShield is seeking treble damages for willful infringement, estimated at $40M–$80M based on Titan's revenue history
- **Ongoing royalties:** 5–8% of Titan's EDR-related revenue (~$2.5M–$3.6M annually)
- **Injunction risk:** An injunction requiring technology modifications could disrupt Titan's platform and customer deployments

Industry analysts note this lawsuit could affect Titan's attractiveness as an acquisition target, as any buyer would need to assume the litigation risk and potential financial exposure.

## Timeline
- Discovery: Through Q2 2025
- Summary judgment motions: Q3 2025
- Trial: Earliest Q4 2025`,

  "titan-wr-004": `# CISO Roundtable: Why We Chose Titan Over CrowdStrike

**Published: November 8, 2024 — Dark Reading**

Three enterprise CISOs share their evaluation of Titan Security's endpoint detection platform and why they chose it over established market leaders.

## Participant 1: CISO at a Fortune 500 Financial Services Firm

"We ran a 90-day bake-off between CrowdStrike Falcon, SentinelOne Singularity, and Titan. In our purple team exercises, Titan detected 14 out of 15 simulated zero-day exploits — CrowdStrike caught 11, SentinelOne caught 10. The behavioral AI engine is genuinely differentiated. The kernel-level instrumentation provides visibility that user-mode solutions simply can't match."

"Our main concern is key-person risk. During the evaluation, we learned that only three engineers deeply understand the detection engine's internals. We negotiated source code escrow provisions in our contract as a mitigation."

## Participant 2: CISO at a Defense Contractor

"FedRAMP High authorization was the deciding factor. In our space, you need FedRAMP and you need ITAR-compliant data handling. Titan checks both boxes. CrowdStrike has FedRAMP Moderate but not High, which ruled them out for our classified workloads."

"The downside is cost. Titan's pricing is 35% above CrowdStrike for comparable endpoint coverage. We justified it based on compliance requirements, but our mid-market subsidiaries use Microsoft Defender because we can't justify Titan's pricing for non-classified environments."

## Participant 3: CISO at a Major Healthcare System

"We evaluated Titan's cloud workload protection alongside their EDR. The integrated threat intelligence feed is excellent — it detected a supply-chain attack on one of our SaaS vendors within 4 hours of the initial compromise. No other tool we tested caught it."

"I do worry about the patent lawsuit. If CrowdShield wins an injunction, Titan would need to modify its core detection engine, which could temporarily reduce efficacy. We have a contingency plan to migrate to CrowdStrike if that happens, but it would be a painful 6-month transition."

## Key Takeaways
- Titan's behavioral AI outperforms competitors in zero-day detection scenarios
- FedRAMP High is a genuine competitive moat for government and regulated industries
- Pricing premium limits mid-market adoption
- Key-person risk and patent litigation are real concerns for long-term customers`,

  "titan-wr-005": `# NovaTech Systems 2025 Strategy: Building In-House Security Capabilities

**Published: December 3, 2024 — CRN**

NovaTech Systems, one of North America's largest managed security service providers (MSSPs) with over 4,000 enterprise clients, has announced a strategic pivot toward building proprietary security technology to reduce its reliance on third-party OEM partnerships.

## The $50M Investment

NovaTech CEO Margaret Huang revealed at the company's annual partner summit that NovaTech will invest $50 million over the next two years to build in-house endpoint detection, network monitoring, and security orchestration capabilities.

"We've been a successful channel partner for several security vendors, but the economics of OEM licensing increasingly don't work for us at scale," Huang said. "By building our own technology stack, we can improve margins, differentiate our managed services, and provide a more integrated experience for our customers."

## Impact on OEM Partners

NovaTech currently bundles endpoint detection technology from Titan Security into its managed services platform, accounting for an estimated $13.5 million in annual revenue for Titan. Industry analysts immediately flagged the announcement as a potential threat to Titan's revenue concentration.

"NovaTech is Titan's largest customer by a significant margin," said Kevin Marsh, cybersecurity analyst at William Blair. "If NovaTech builds or acquires its own EDR capability, Titan could lose 30% of its ARR within 12–18 months. That's an existential revenue risk."

NovaTech's contract with Titan runs through December 2025, with a 180-day non-renewal notice window opening in June 2025. NovaTech declined to comment on specific OEM contract renewals but noted that "all vendor relationships are under strategic review."

## Titan's Response

Titan Security did not respond to requests for comment. Sources close to the company suggest Titan is aware of NovaTech's plans and is exploring alternative channel strategies, including partnerships with other MSSPs and an expanded direct sales motion.

However, analysts note that Titan's OEM agreement with NovaTech includes exclusivity provisions that prevent Titan from partnering with other MSSPs in North America during the term of the agreement and for 12 months post-termination, significantly limiting Titan's ability to replace the NovaTech channel quickly.

## Analyst Perspective

"This is a classic OEM dependency story," said Sarah Chen, managing director at Houlihan Lokey's technology M&A practice. "Titan has built excellent technology, but 30% revenue concentration in a single channel partner with a ticking clock is a material risk for any acquirer. The question isn't whether NovaTech will reduce its dependency on Titan — it's when and how fast."`,
};

// ── Finance ────────────────────────────────────────────────────────────────────

export const titanKpis = {
  asOfDate: "2024-12-31",
  blended: {
    arr: 45_000_000,
    arrGrowthYoY: 0.48,
    nrr: 1.28,
    grossRetention: 0.91,
    totalCustomers: 340,
    avgContractValue: 132_350,
    mrrGrowthRate: 0.034,
    grossMargin: 0.82,
    ruleOf40: 42,
    ltv_cac: 4.1,
    cacPaybackMonths: 15,
    burnRateMonthly: 2_400_000,
    cashRemaining: 38_000_000,
    runwayMonths: 16,
  },
  segments: {
    enterprise: {
      arr: 17_600_000,
      nrr: 1.35,
      grossRetention: 0.94,
      customers: 128,
      avgContractValue: 137_500,
      logoChurnTrailing12m: 8,
    },
    midMarket: {
      arr: 5_900_000,
      nrr: 1.05,
      grossRetention: 0.82,
      customers: 162,
      avgContractValue: 36_420,
      logoChurnTrailing12m: 29,
    },
    government: {
      arr: 8_000_000,
      nrr: 1.22,
      grossRetention: 0.97,
      customers: 50,
      avgContractValue: 160_000,
      logoChurnTrailing12m: 1,
    },
    oem: {
      arr: 13_500_000,
      nrr: 1.18,
      grossRetention: 1.0,
      customers: 1,
      avgContractValue: 13_500_000,
      logoChurnTrailing12m: 0,
    },
  },
  commentary: [
    "Blended NRR of 128% is supported by strong enterprise expansion (135%) and OEM endpoint growth (118%).",
    "Mid-market NRR of 105% and gross retention of 82% reflect competitive pricing pressure from Microsoft Defender and SentinelOne.",
    "Government segment has best-in-class retention (97% GRR) driven by compliance lock-in (FedRAMP, ITAR).",
    "⚠ OEM channel (NovaTech) represents $13.5M / 30% of ARR through a single partner with contract expiry in Dec 2025.",
    "R&D spending at 45% of revenue ($20.3M) is significantly above cybersecurity SaaS median of 25–30%, reflecting heavy investment in detection engine and patent portfolio defense.",
    "Gross margin of 82% is strong, but the NovaTech OEM channel earns lower effective margin (68%) due to dedicated support costs.",
  ],
};

export const titanCohorts = {
  enterprise: [
    { cohortQuarter: "Q1 2023", month0: 100, month3: 99, month6: 98, month9: 97, month12: 96 },
    { cohortQuarter: "Q2 2023", month0: 100, month3: 99, month6: 98, month9: 97, month12: 95 },
    { cohortQuarter: "Q3 2023", month0: 100, month3: 98, month6: 97, month9: 96, month12: 95 },
    { cohortQuarter: "Q4 2023", month0: 100, month3: 99, month6: 98, month9: 97, month12: 96 },
    { cohortQuarter: "Q1 2024", month0: 100, month3: 99, month6: 98, month9: 97, month12: 95 },
    { cohortQuarter: "Q2 2024", month0: 100, month3: 98, month6: 97, month9: 96, month12: 94 },
  ],
  midMarket: [
    { cohortQuarter: "Q1 2023", month0: 100, month3: 95, month6: 90, month9: 86, month12: 83 },
    { cohortQuarter: "Q2 2023", month0: 100, month3: 94, month6: 89, month9: 85, month12: 82 },
    { cohortQuarter: "Q3 2023", month0: 100, month3: 94, month6: 88, month9: 84, month12: 81 },
    { cohortQuarter: "Q4 2023", month0: 100, month3: 93, month6: 87, month9: 83, month12: 80 },
    { cohortQuarter: "Q1 2024", month0: 100, month3: 93, month6: 87, month9: 82, month12: 79 },
    { cohortQuarter: "Q2 2024", month0: 100, month3: 92, month6: 86, month9: 81, month12: 78 },
  ],
  government: [
    { cohortQuarter: "Q1 2023", month0: 100, month3: 100, month6: 100, month9: 100, month12: 99 },
    { cohortQuarter: "Q2 2023", month0: 100, month3: 100, month6: 100, month9: 99, month12: 99 },
    { cohortQuarter: "Q3 2023", month0: 100, month3: 100, month6: 100, month9: 100, month12: 98 },
    { cohortQuarter: "Q4 2023", month0: 100, month3: 100, month6: 100, month9: 100, month12: 99 },
    { cohortQuarter: "Q1 2024", month0: 100, month3: 100, month6: 100, month9: 99, month12: 98 },
    { cohortQuarter: "Q2 2024", month0: 100, month3: 100, month6: 100, month9: 99, month12: 97 },
  ],
};

export const titanCohortCommentary: Record<string, string> = {
  enterprise:
    "Enterprise cohorts show strong retention at 94–96% at 12 months. Expansion within enterprise accounts (additional modules, endpoint growth) drives 135% NRR. Slight softening in Q2 2024 cohort warrants monitoring.",
  midMarket:
    "⚠ Mid-market cohorts show consistent erosion, with recent cohorts dropping to 78–79% at 12 months. Competitive displacement by lower-priced alternatives (Microsoft Defender, SentinelOne) is the primary driver. Mid-market ACVs ($36K) may not justify Titan's premium pricing.",
  government:
    "Government cohorts are exceptionally stable at 97–99% retention. FedRAMP/ITAR compliance requirements create significant switching costs. Renewal cycles are longer (typically 3–5 year base terms) with strong re-compete win rates.",
};

export const titanRevenueBridge = {
  period: "FY2024 (Jan 2024 – Dec 2024)",
  beginningArr: 30_400_000,
  components: {
    newBusiness: 8_200_000,
    expansion: 9_800_000,
    contraction: -1_100_000,
    churn: -2_300_000,
  },
  endingArr: 45_000_000,
  derivedMetrics: {
    grossNewArr: 18_000_000,
    netNewArr: 14_600_000,
    grossRetention: 0.91,
    nrr: 1.28,
    impliedChurnRate: 0.076,
  },
  segmentBreakdown: {
    enterprise: {
      beginningArr: 11_200_000,
      newBusiness: 3_400_000,
      expansion: 3_700_000,
      contraction: -400_000,
      churn: -300_000,
      endingArr: 17_600_000,
    },
    midMarket: {
      beginningArr: 5_800_000,
      newBusiness: 1_600_000,
      expansion: 500_000,
      contraction: -500_000,
      churn: -1_500_000,
      endingArr: 5_900_000,
      note:
        "⚠ Mid-market net new ARR is only $100K — nearly all new business is offset by churn and contraction. This segment is effectively flat and acting as a drag on blended growth metrics.",
    },
    government: {
      beginningArr: 5_400_000,
      newBusiness: 2_200_000,
      expansion: 900_000,
      contraction: -200_000,
      churn: -300_000,
      endingArr: 8_000_000,
    },
    oem: {
      beginningArr: 8_000_000,
      newBusiness: 1_000_000,
      expansion: 4_700_000,
      contraction: 0,
      churn: -200_000,
      endingArr: 13_500_000,
      note:
        "⚠ OEM expansion of $4.7M reflects NovaTech's organic endpoint growth, not Titan's direct sales effort. This revenue is entirely dependent on NovaTech's business trajectory and contract renewal decision in 2025.",
    },
  },
  qualityOfEarningsNotes: [
    "The CIM presents 48% YoY growth, but organic growth (excluding OEM endpoint expansion) is approximately 32% — still strong but materially lower than the headline figure.",
    "⚠ OEM revenue ($13.5M, 30%) flows through a single partner whose contract expires Dec 2025 and who has announced plans to build competing capabilities.",
    "Government revenue is highly recurring and sticky, but $4.85M (10.8% of total) is ITAR-restricted and subject to change-of-control regulatory review.",
    "R&D spending at 45% of revenue reflects both product investment and the cost of defending the patent portfolio — $1.8M in legal fees related to the CrowdShield litigation are included in R&D expense.",
    "⚠ Mid-market segment is a value detractor — its churn rate (25.9% implied) significantly exceeds the blended figure, and competitive pressure suggests further deterioration.",
  ],
};
