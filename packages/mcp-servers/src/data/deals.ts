export interface DealProfile {
  dealId: string;
  codeName: string;
  sector: string;
  description: string;
  targetARR: string;
  targetGrowth: string;
  keyMetric: string;
  stage: string;
}

export const DEALS: Record<string, DealProfile> = {
  atlas: {
    dealId: "atlas",
    codeName: "Project Atlas",
    sector: "Supply Chain SaaS",
    description: "Supply-chain orchestration platform",
    targetARR: "$62.4M",
    targetGrowth: "63% YoY",
    keyMetric: "140% NRR",
    stage: "initial-review",
  },
  titan: {
    dealId: "titan",
    codeName: "Project Titan",
    sector: "Cybersecurity",
    description: "Cloud-native endpoint security platform",
    targetARR: "$45M",
    targetGrowth: "48% YoY",
    keyMetric: "Enterprise 90%+ mix",
    stage: "initial-review",
  },
  meridian: {
    dealId: "meridian",
    codeName: "Project Meridian",
    sector: "Healthcare Analytics",
    description: "Clinical analytics and population health platform",
    targetARR: "$28M",
    targetGrowth: "35% YoY",
    keyMetric: "95% GRR",
    stage: "initial-review",
  },
};

export function getDeal(dealId?: string): DealProfile {
  return DEALS[dealId ?? "atlas"] ?? DEALS.atlas;
}

export function listDeals(): DealProfile[] {
  return Object.values(DEALS);
}
