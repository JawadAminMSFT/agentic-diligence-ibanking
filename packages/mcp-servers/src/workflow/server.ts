import { z } from "zod";
import { createMcpServer, startStdioServer } from "../shared/mcp-helpers.js";

const server = createMcpServer("workflow", "1.0.0");

interface Issue {
  issueId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  workstream: "commercial" | "financial" | "legal" | "synthesis";
  nextAction: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
}

interface SellerQuestion {
  draftId: string;
  question: string;
  context: string;
  priority: "low" | "medium" | "high";
  status: "draft" | "pending-approval" | "sent" | "answered";
  createdAt: string;
}

const issues: Issue[] = [];
const sellerQuestions: SellerQuestion[] = [];
let issueCounter = 0;
let draftCounter = 0;

// --- Tool: create_issue ---
server.tool(
  "create_issue",
  {
    title: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    workstream: z.enum(["commercial", "financial", "legal", "synthesis"]),
    nextAction: z.string(),
  },
  async ({ title, description, severity, workstream, nextAction }) => {
    issueCounter++;
    const issue: Issue = {
      issueId: `ISS-${String(issueCounter).padStart(3, "0")}`,
      title,
      description,
      severity,
      workstream,
      nextAction,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    issues.push(issue);
    return { content: [{ type: "text", text: JSON.stringify(issue, null, 2) }] };
  }
);

// --- Tool: draft_seller_question ---
server.tool(
  "draft_seller_question",
  {
    question: z.string(),
    context: z.string(),
    priority: z.enum(["low", "medium", "high"]),
  },
  async ({ question, context, priority }) => {
    draftCounter++;
    const draft: SellerQuestion = {
      draftId: `SQ-${String(draftCounter).padStart(3, "0")}`,
      question,
      context,
      priority,
      status: "pending-approval",
      createdAt: new Date().toISOString(),
    };
    sellerQuestions.push(draft);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ...draft,
              approvalRequired: true,
              message:
                "This is a tier-2 action. The drafted question requires human approval before being sent to the seller.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// --- Tool: list_issues ---
server.tool("list_issues", {}, async () => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            totalIssues: issues.length,
            totalSellerQuestions: sellerQuestions.length,
            issues,
            sellerQuestions,
          },
          null,
          2
        ),
      },
    ],
  };
});

startStdioServer(server);
