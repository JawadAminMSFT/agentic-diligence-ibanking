import { z } from "zod";
import { createMcpServer, startStdioServer } from "../shared/mcp-helpers.js";
import { getDeal } from "../data/deals.js";

const dealId = process.env.DEAL_ID ?? "atlas";
const deal = getDeal(dealId);

const server = createMcpServer("memo", "1.0.0");

interface MemoSection {
  name: string;
  markdown: string;
  evidenceIds: string[];
  updatedAt: string;
}

const sections: Map<string, MemoSection> = new Map();

// Pre-populate with empty section stubs
const sectionNames = [
  "executive-summary",
  "commercial",
  "financial",
  "legal",
  "open-issues",
  "recommendation",
];

for (const name of sectionNames) {
  sections.set(name, {
    name,
    markdown: "",
    evidenceIds: [],
    updatedAt: new Date().toISOString(),
  });
}

// --- Tool: read_section ---
server.tool("read_section", { name: z.string() }, async ({ name }) => {
  const section = sections.get(name);
  if (!section) {
    return {
      content: [
        {
          type: "text",
          text: `Section "${name}" not found. Available sections: ${[...sections.keys()].join(", ")}`,
        },
      ],
      isError: true,
    };
  }
  return { content: [{ type: "text", text: JSON.stringify(section, null, 2) }] };
});

// --- Tool: write_section ---
server.tool(
  "write_section",
  {
    name: z.string(),
    markdown: z.string(),
    evidenceIds: z.array(z.string()),
  },
  async ({ name, markdown, evidenceIds }) => {
    const section: MemoSection = {
      name,
      markdown,
      evidenceIds,
      updatedAt: new Date().toISOString(),
    };
    sections.set(name, section);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { message: `Section "${name}" updated successfully.`, section },
            null,
            2
          ),
        },
      ],
    };
  }
);

// --- Tool: read_full_memo ---
server.tool("read_full_memo", {}, async () => {
  const allSections = [...sections.values()];
  const assembled = allSections
    .map((s) => {
      const heading = `## ${s.name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}`;
      const body = s.markdown || "_No content yet._";
      const evidence =
        s.evidenceIds.length > 0
          ? `\n\n**Evidence:** ${s.evidenceIds.join(", ")}`
          : "";
      return `${heading}\n\n${body}${evidence}`;
    })
    .join("\n\n---\n\n");

  const fullMemo = `# ${deal.codeName} — Investment Memo\n\n${assembled}`;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            totalSections: allSections.length,
            sectionsWithContent: allSections.filter((s) => s.markdown.length > 0).length,
            memo: fullMemo,
          },
          null,
          2
        ),
      },
    ],
  };
});

startStdioServer(server);
