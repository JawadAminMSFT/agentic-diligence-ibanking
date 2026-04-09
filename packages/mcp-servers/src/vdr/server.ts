import { z } from "zod";
import { createMcpServer, startStdioServer } from "../shared/mcp-helpers.js";
import type { VdrDocument } from "../data/atlas.js";
import { atlasVdrDocuments, atlasVdrContent } from "../data/atlas.js";
import { titanVdrDocuments, titanVdrContent } from "../data/titan.js";
import { meridianVdrDocuments, meridianVdrContent } from "../data/meridian.js";

const dealId = process.env.DEAL_ID ?? "atlas";

const dealData: Record<string, { documents: VdrDocument[]; content: Record<string, string> }> = {
  atlas: { documents: atlasVdrDocuments, content: atlasVdrContent },
  titan: { documents: titanVdrDocuments, content: titanVdrContent },
  meridian: { documents: meridianVdrDocuments, content: meridianVdrContent },
};

const { documents, content: documentContent } = dealData[dealId] ?? dealData.atlas;

const server = createMcpServer("vdr", "1.0.0");

// --- Tool: search_documents ---
server.tool("search_documents", { query: z.string() }, async ({ query }) => {
  const q = query.toLowerCase();
  const matched = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.snippet.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      q.includes("all") ||
      q.includes("document") ||
      q.includes("list")
  );
  const results = matched.length > 0 ? matched : documents;
  return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
});

// --- Tool: open_document ---
server.tool("open_document", { documentId: z.string() }, async ({ documentId }) => {
  const content = documentContent[documentId];
  if (!content) {
    return {
      content: [{ type: "text", text: `No document found for documentId: ${documentId}` }],
      isError: true,
    };
  }
  return { content: [{ type: "text", text: content }] };
});

startStdioServer(server);