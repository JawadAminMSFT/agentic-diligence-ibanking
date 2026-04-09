import { z } from "zod";
import { createMcpServer, startStdioServer } from "../shared/mcp-helpers.js";
import { atlasKpis, atlasCohorts, atlasCohortCommentary, atlasRevenueBridge } from "../data/atlas.js";
import { titanKpis, titanCohorts, titanCohortCommentary, titanRevenueBridge } from "../data/titan.js";
import { meridianKpis, meridianCohorts, meridianCohortCommentary, meridianRevenueBridge } from "../data/meridian.js";

const dealId = process.env.DEAL_ID ?? "atlas";

interface DealFinanceData {
  kpis: Record<string, unknown>;
  cohorts: Record<string, { cohortQuarter: string; month0: number; month3: number; month6: number; month9: number; month12: number }[]>;
  cohortCommentary: Record<string, string>;
  revenueBridge: Record<string, unknown>;
}

const dealData: Record<string, DealFinanceData> = {
  atlas: { kpis: atlasKpis, cohorts: atlasCohorts, cohortCommentary: atlasCohortCommentary, revenueBridge: atlasRevenueBridge },
  titan: { kpis: titanKpis, cohorts: titanCohorts, cohortCommentary: titanCohortCommentary, revenueBridge: titanRevenueBridge },
  meridian: { kpis: meridianKpis, cohorts: meridianCohorts, cohortCommentary: meridianCohortCommentary, revenueBridge: meridianRevenueBridge },
};

const { kpis, cohorts, cohortCommentary, revenueBridge } = dealData[dealId] ?? dealData.atlas;

const server = createMcpServer("finance", "1.0.0");

// --- Tool: load_kpis ---
server.tool("load_kpis", {}, async () => {
  return { content: [{ type: "text", text: JSON.stringify(kpis, null, 2) }] };
});

// --- Tool: compute_cohorts ---
server.tool(
  "compute_cohorts",
  { segment: z.string().optional() },
  async ({ segment }) => {
    if (segment && segment.toLowerCase() in cohorts) {
      const seg = segment.toLowerCase();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { segment: seg, cohorts: cohorts[seg], commentary: cohortCommentary[seg] },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              allSegments: Object.keys(cohorts).map((seg) => ({
                segment: seg,
                cohorts: cohorts[seg],
                commentary: cohortCommentary[seg],
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// --- Tool: revenue_bridge ---
server.tool("revenue_bridge", {}, async () => {
  return { content: [{ type: "text", text: JSON.stringify(revenueBridge, null, 2) }] };
});

startStdioServer(server);