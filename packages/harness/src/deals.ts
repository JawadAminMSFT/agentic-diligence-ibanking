export interface DealDocument {
  documentId: string;
  title: string;
  category: string;
  snippet: string;
  uploadedAt: string;
}

export const DEAL_DOCUMENTS: Record<string, DealDocument[]> = {
  atlas: [
    { documentId: "vdr-001", title: "Confidential Information Memorandum (CIM)", category: "Overview", snippet: "Comprehensive overview of Atlas Software: $62M ARR, 140% NRR, 800+ customers", uploadedAt: "2025-01-05" },
    { documentId: "vdr-002", title: "Management Presentation — Q4 2024 Board Deck", category: "Management", snippet: "Board presentation covering Q4 results, 2025 plan, product roadmap", uploadedAt: "2025-01-06" },
    { documentId: "vdr-003", title: "Customer List & Revenue Breakdown", category: "Commercial", snippet: "Full customer list with ARR by segment. 812 active customers.", uploadedAt: "2025-01-07" },
    { documentId: "vdr-004", title: "Monthly KPI Workbook — Trailing 12 Months", category: "Financial", snippet: "NRR, GRR, churn, cohort retention, revenue bridge by segment", uploadedAt: "2025-01-07" },
    { documentId: "vdr-005", title: "Key Customer Contracts — Summary of Terms", category: "Legal", snippet: "Top customer contracts with CoC, assignment, and liability provisions", uploadedAt: "2025-01-08" },
    { documentId: "vdr-006", title: "Organization Chart & Key Personnel", category: "HR", snippet: "Org structure, key employee contracts, non-compete status", uploadedAt: "2025-01-08" },
    { documentId: "vdr-007", title: "Capitalization Table — Fully Diluted", category: "Financial", snippet: "Equity ownership, option pool, dilution analysis", uploadedAt: "2025-01-09" },
    { documentId: "vdr-008", title: "Technology Architecture & Infrastructure", category: "Technology", snippet: "System architecture, cloud infrastructure, security posture", uploadedAt: "2025-01-09" },
    { documentId: "vdr-009", title: "Historical Financial Statements — FY2022-FY2024", category: "Financial", snippet: "P&L, balance sheet, cash flow statements", uploadedAt: "2025-01-10" },
  ],
  titan: [
    { documentId: "titan-vdr-001", title: "Confidential Information Memorandum (CIM)", category: "Overview", snippet: "Titan Security: $45M ARR, 48% YoY growth, cloud-native endpoint security", uploadedAt: "2025-01-10" },
    { documentId: "titan-vdr-002", title: "Customer List & Revenue Breakdown", category: "Commercial", snippet: "340 active customers including government and enterprise accounts", uploadedAt: "2025-01-11" },
    { documentId: "titan-vdr-003", title: "Patent Portfolio & Pending Litigation", category: "Legal", snippet: "Patent portfolio summary and CrowdShield lawsuit details", uploadedAt: "2025-01-11" },
    { documentId: "titan-vdr-004", title: "OEM Partnership Agreement — NovaTech", category: "Commercial", snippet: "NovaTech OEM agreement terms, revenue share, exclusivity provisions", uploadedAt: "2025-01-12" },
    { documentId: "titan-vdr-005", title: "KPI Workbook & Financial Model", category: "Financial", snippet: "Segment-level KPIs, cohort retention, revenue bridge", uploadedAt: "2025-01-12" },
    { documentId: "titan-vdr-006", title: "Team Org Chart & Key Personnel", category: "HR", snippet: "Core detection engine team, key-person dependencies", uploadedAt: "2025-01-12" },
  ],
  meridian: [
    { documentId: "meridian-vdr-001", title: "Confidential Information Memorandum (CIM)", category: "Overview", snippet: "Meridian Health Analytics: $28M ARR, 35% YoY growth", uploadedAt: "2025-01-14" },
    { documentId: "meridian-vdr-002", title: "Customer List & Revenue Breakdown", category: "Commercial", snippet: "82 active accounts with significant concentration in top customer", uploadedAt: "2025-01-14" },
    { documentId: "meridian-vdr-003", title: "BAA Template & HIPAA Compliance Audit", category: "Legal", snippet: "Business Associate Agreement and compliance assessment", uploadedAt: "2025-01-15" },
    { documentId: "meridian-vdr-004", title: "Founder Employment Agreement & IP Assignment", category: "Legal", snippet: "Founder LLC IP structure, employment terms", uploadedAt: "2025-01-15" },
    { documentId: "meridian-vdr-005", title: "KPI Workbook & Financial Model", category: "Financial", snippet: "Revenue, retention, implementation backlog metrics", uploadedAt: "2025-01-16" },
    { documentId: "meridian-vdr-006", title: "SOC 2 & Regulatory Status", category: "Compliance", snippet: "SOC 2 Type I status, HIPAA gaps in MeridianPredict", uploadedAt: "2025-01-16" },
  ],
};

export interface DealInfo {
  dealId: string;
  codeName: string;
  sector: string;
  description: string;
  targetARR: string;
  targetGrowth: string;
  keyMetric: string;
}

export const AVAILABLE_DEALS: DealInfo[] = [
  {
    dealId: "atlas",
    codeName: "Project Atlas",
    sector: "Supply Chain SaaS",
    description: "Supply-chain orchestration platform",
    targetARR: "$62.4M",
    targetGrowth: "63% YoY",
    keyMetric: "140% NRR",
  },
  {
    dealId: "titan",
    codeName: "Project Titan",
    sector: "Cybersecurity",
    description: "Cloud-native endpoint security platform",
    targetARR: "$45M",
    targetGrowth: "48% YoY",
    keyMetric: "Enterprise 90%+ mix",
  },
  {
    dealId: "meridian",
    codeName: "Project Meridian",
    sector: "Healthcare Analytics",
    description: "Clinical analytics and population health platform",
    targetARR: "$28M",
    targetGrowth: "35% YoY",
    keyMetric: "95% GRR",
  },
];
