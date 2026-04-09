import { z } from "zod";
import { createMcpServer, startStdioServer } from "../shared/mcp-helpers.js";
import type { SearchResult } from "../data/atlas.js";
import { atlasSearchResults, atlasPageContent } from "../data/atlas.js";
import { titanSearchResults, titanPageContent } from "../data/titan.js";
import { meridianSearchResults, meridianPageContent } from "../data/meridian.js";

const dealId = process.env.DEAL_ID ?? "atlas";

const dealData: Record<string, { searchResults: SearchResult[]; pageContent: Record<string, string> }> = {
  atlas: { searchResults: atlasSearchResults, pageContent: atlasPageContent },
  titan: { searchResults: titanSearchResults, pageContent: titanPageContent },
  meridian: { searchResults: meridianSearchResults, pageContent: meridianPageContent },
};

const { searchResults, pageContent } = dealData[dealId] ?? dealData.atlas;

const server = createMcpServer("web-research", "1.0.0");

// --- Tool: search ---
server.tool("search", { query: z.string() }, async ({ query }) => {
  const q = query.toLowerCase();
  const matched = searchResults.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.snippet.toLowerCase().includes(q) ||
      r.publisher.toLowerCase().includes(q) ||
      q.includes("company") ||
      q.includes("all")
  );
  const results = matched.length > 0 ? matched : searchResults;
  return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
});

// --- Tool: open_page ---
server.tool("open_page", { resultId: z.string() }, async ({ resultId }) => {
  const content = pageContent[resultId];
  if (!content) {
    return {
      content: [{ type: "text", text: `No page found for resultId: ${resultId}` }],
      isError: true,
    };
  }
  return { content: [{ type: "text", text: content }] };
});

startStdioServer(server);
