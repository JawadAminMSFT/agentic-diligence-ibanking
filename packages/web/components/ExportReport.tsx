"use client";

import type { MemoSection, Issue } from "@/lib/api-client";

/** Convert basic markdown to HTML for print view. */
function markdownToHTML(md: string): string {
  let html = md
    // Headings: ## heading → <h3>
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h3>$1</h3>")
    // Bold: **text** → <strong>
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* → <em>
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Convert list items: lines starting with - or *
  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;
  for (const line of lines) {
    const listMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (listMatch) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      // Blank line → paragraph break, otherwise line break
      if (line.trim() === "") {
        result.push("<br/>");
      } else if (!line.startsWith("<h3>")) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  }
  if (inList) result.push("</ul>");

  return result.join("\n");
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function generateReportHTML(
  dealName: string,
  memo: MemoSection[],
  issues: Issue[],
): string {
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const memoSectionsHTML = memo
    .map((section) => {
      const confPct = Math.round(section.confidence * 100);
      return `
      <div class="section">
        <h2>
          ${escapeHTML(section.title)}
          <span class="confidence">Confidence: ${confPct}%</span>
        </h2>
        <div class="section-content">${markdownToHTML(section.content)}</div>
      </div>`;
    })
    .join("\n");

  const sortedIssues = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2),
  );

  const issueRowsHTML = sortedIssues
    .map(
      (issue, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(issue.title)}</td>
        <td class="severity-${issue.severity}">${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}</td>
        <td>${escapeHTML(issue.workstream)}</td>
        <td>${escapeHTML(issue.description)}</td>
        <td>${escapeHTML(issue.nextAction)}</td>
      </tr>`,
    )
    .join("\n");

  const issuesTableHTML =
    sortedIssues.length > 0
      ? `
      <div class="section">
        <h2>Open Issues (${sortedIssues.length})</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Workstream</th>
              <th>Description</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>${issueRowsHTML}</tbody>
        </table>
      </div>`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHTML(dealName)} — Due Diligence Report</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 24px; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; }
    h2 { font-size: 18px; color: #333; margin-top: 32px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    h3 { font-size: 15px; color: #444; margin-top: 16px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; page-break-inside: avoid; }
    .section-content { line-height: 1.8; font-size: 14px; }
    .section-content p { margin: 4px 0; }
    .section-content ul { margin: 8px 0; padding-left: 24px; }
    .section-content li { margin: 2px 0; }
    .confidence { float: right; font-size: 12px; color: #666; font-weight: normal; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #f5f5f5; text-align: left; padding: 8px 12px; border: 1px solid #ddd; font-weight: 600; }
    td { padding: 8px 12px; border: 1px solid #ddd; vertical-align: top; }
    .severity-high { color: #dc2626; font-weight: 600; }
    .severity-medium { color: #d97706; font-weight: 600; }
    .severity-low { color: #2563eb; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Buy-side Diligence Copilot — Investment Memo</h1>
  <div class="meta">${escapeHTML(dealName)} &mdash; ${now}</div>
  ${memoSectionsHTML}
  ${issuesTableHTML}
  <div class="footer">Generated by Buy-side Diligence Copilot</div>
</body>
</html>`;
}

export function exportReport(
  dealName: string,
  memo: MemoSection[],
  issues: Issue[],
): void {
  const html = generateReportHTML(dealName, memo, issues);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

interface ExportReportButtonProps {
  dealName: string;
  memo: MemoSection[];
  issues: Issue[];
}

export default function ExportReportButton({
  dealName,
  memo,
  issues,
}: ExportReportButtonProps) {
  const disabled = memo.length === 0;

  return (
    <button
      onClick={() => exportReport(dealName, memo, issues)}
      disabled={disabled}
      className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 hover:border-slate-300 disabled:hover:border-slate-200 px-3 py-1.5 rounded-md transition-colors"
      title={disabled ? "No memo content to export" : "Export report as PDF"}
    >
      Export Report
    </button>
  );
}
