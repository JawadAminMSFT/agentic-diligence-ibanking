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
