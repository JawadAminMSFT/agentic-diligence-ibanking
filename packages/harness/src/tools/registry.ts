export type ToolTier = 0 | 1 | 2;

export interface ToolRegistryEntry {
  name: string;
  mcpServer: string;
  tier: ToolTier;
  description: string;
}

/**
 * Tier 0: auto-approved (read/search operations)
 * Tier 1: log-and-proceed (create issues, write memo)
 * Tier 2: require human approval (seller-facing actions)
 */
export const toolRegistry: ToolRegistryEntry[] = [
  // --- web-research MCP server ---
  {
    name: "web_research.search",
    mcpServer: "web-research",
    tier: 0,
    description: "Search the web for public information",
  },
  {
    name: "web_research.fetch_page",
    mcpServer: "web-research",
    tier: 0,
    description: "Fetch and extract content from a web page",
  },
  {
    name: "web_research.summarise",
    mcpServer: "web-research",
    tier: 0,
    description: "Summarise content from a web source",
  },

  // --- vdr MCP server ---
  {
    name: "vdr.list_documents",
    mcpServer: "vdr",
    tier: 0,
    description: "List documents in the virtual data room",
  },
  {
    name: "vdr.read_document",
    mcpServer: "vdr",
    tier: 0,
    description: "Read a specific document from the VDR",
  },
  {
    name: "vdr.search",
    mcpServer: "vdr",
    tier: 0,
    description: "Full-text search across VDR documents",
  },

  // --- finance MCP server ---
  {
    name: "finance.extract_kpis",
    mcpServer: "finance",
    tier: 0,
    description: "Extract key financial KPIs from documents",
  },
  {
    name: "finance.build_revenue_bridge",
    mcpServer: "finance",
    tier: 0,
    description: "Build a revenue bridge analysis",
  },
  {
    name: "finance.analyse_retention",
    mcpServer: "finance",
    tier: 0,
    description: "Analyse customer retention and churn metrics",
  },
  {
    name: "finance.detect_anomalies",
    mcpServer: "finance",
    tier: 0,
    description: "Detect anomalies in financial data",
  },

  // --- workflow MCP server ---
  {
    name: "workflow.create_issue",
    mcpServer: "workflow",
    tier: 1,
    description: "Create an open issue for tracking",
  },
  {
    name: "workflow.resolve_contradiction",
    mcpServer: "workflow",
    tier: 1,
    description: "Record resolution of a contradiction",
  },
  {
    name: "workflow.list_issues",
    mcpServer: "workflow",
    tier: 0,
    description: "List all open issues",
  },
  {
    name: "workflow.draft_seller_question",
    mcpServer: "workflow",
    tier: 2,
    description: "Draft a question for the seller (requires human approval)",
  },

  // --- memo MCP server ---
  {
    name: "memo.read_section",
    mcpServer: "memo",
    tier: 0,
    description: "Read a section of the IC memo",
  },
  {
    name: "memo.write_section",
    mcpServer: "memo",
    tier: 1,
    description: "Write or update a section of the IC memo",
  },
  {
    name: "memo.list_sections",
    mcpServer: "memo",
    tier: 0,
    description: "List all sections of the IC memo",
  },
];

const registryMap = new Map<string, ToolRegistryEntry>(
  toolRegistry.map((t) => [t.name, t])
);

export function getToolEntry(name: string): ToolRegistryEntry | undefined {
  return registryMap.get(name);
}

export function getToolTier(name: string): ToolTier {
  return registryMap.get(name)?.tier ?? 0;
}
