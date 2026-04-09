import { z } from "zod";
import PptxGenJS from "pptxgenjs";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { createMcpServer, startStdioServer } from "../shared/mcp-helpers.js";

const server = createMcpServer("artifacts", "1.0.0");

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR ?? "./artifacts/default";

function ensureDir() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

function writeArtifact(filename: string, content: string): number {
  ensureDir();
  const filePath = path.join(ARTIFACTS_DIR, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return Buffer.byteLength(content, "utf-8");
}

function writeArtifactBuffer(filename: string, buffer: Buffer): number {
  ensureDir();
  const filePath = path.join(ARTIFACTS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

// ---------------------------------------------------------------------------
// PDF helper: render inline markdown (bold markers) within a line
// ---------------------------------------------------------------------------
function renderMarkdownLine(doc: PDFKit.PDFDocument, text: string, indent: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const nonEmpty = parts.filter((p) => p.length > 0);
  if (nonEmpty.length === 0) {
    doc.text("", { indent });
    return;
  }
  for (let i = 0; i < nonEmpty.length; i++) {
    const part = nonEmpty[i];
    const isLast = i === nonEmpty.length - 1;
    const opts: PDFKit.Mixins.TextOptions = { continued: !isLast };
    if (i === 0) opts.indent = indent;
    if (part.startsWith("**") && part.endsWith("**")) {
      doc.font("Helvetica-Bold").text(part.slice(2, -2), opts);
    } else {
      doc.font("Helvetica").text(part, opts);
    }
  }
}

// ---------------------------------------------------------------------------
// PDF helper: render a real table with header row, borders, alternating fills
// ---------------------------------------------------------------------------
function renderTable(doc: PDFKit.PDFDocument, rows: string[][]) {
  if (rows.length === 0) return;
  const colCount = rows[0].length;
  const tableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = tableWidth / colCount;
  const rowHeight = 22;
  const startX = doc.page.margins.left;
  let y = doc.y;

  for (let ri = 0; ri < rows.length; ri++) {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    const isHeader = ri === 0;
    const isEven = ri % 2 === 0;

    // Row background
    if (isHeader) {
      doc.rect(startX, y, tableWidth, rowHeight).fill("#1e293b");
    } else if (isEven) {
      doc.rect(startX, y, tableWidth, rowHeight).fill("#f8fafc");
    } else {
      doc.rect(startX, y, tableWidth, rowHeight).fill("#ffffff");
    }

    // Cell border
    doc
      .rect(startX, y, tableWidth, rowHeight)
      .strokeColor("#e2e8f0")
      .lineWidth(0.5)
      .stroke();

    // Cell text
    for (let ci = 0; ci < rows[ri].length; ci++) {
      const cellX = startX + ci * colWidth;
      const cellText = rows[ri][ci].trim();
      doc
        .fontSize(8.5)
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fillColor(isHeader ? "#ffffff" : "#334155")
        .text(cellText, cellX + 5, y + 5, {
          width: colWidth - 10,
          height: rowHeight - 10,
        });
    }

    y += rowHeight;
  }

  doc.x = doc.page.margins.left;
  doc.y = y + 8;
}

// ---------------------------------------------------------------------------
// PDF helper: render a callout / finding box
// ---------------------------------------------------------------------------
const CALLOUT_COLORS: Record<string, { bg: string; border: string; fg: string }> = {
  "KEY FINDING": { bg: "#eff6ff", border: "#3b82f6", fg: "#1e40af" },
  WARNING: { bg: "#fefce8", border: "#f59e0b", fg: "#92400e" },
  CRITICAL: { bg: "#fef2f2", border: "#ef4444", fg: "#991b1b" },
  "OVERALL ASSESSMENT": { bg: "#f0fdf4", border: "#22c55e", fg: "#166534" },
};

function renderCallout(
  doc: PDFKit.PDFDocument,
  type: string,
  text: string,
) {
  const c = CALLOUT_COLORS[type] ?? CALLOUT_COLORS["KEY FINDING"];
  const boxWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Ensure space for the box
  if (doc.y + 34 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  const boxY = doc.y;
  doc.rect(doc.page.margins.left, boxY, boxWidth, 30).fill(c.bg);
  doc.rect(doc.page.margins.left, boxY, 3, 30).fill(c.border);

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(c.fg)
    .text(`${type}: ${text}`, doc.page.margins.left + 10, boxY + 8, {
      width: boxWidth - 20,
    });

  doc.x = doc.page.margins.left;
  doc.y = boxY + 36;
}

// ---------------------------------------------------------------------------
// PDF helper: detect callout prefix in a line
// ---------------------------------------------------------------------------
const CALLOUT_PREFIXES = [
  "KEY FINDING:",
  "WARNING:",
  "CRITICAL:",
  "OVERALL ASSESSMENT:",
];

function matchCallout(line: string): { type: string; body: string } | null {
  const trimmed = line.replace(/\*\*/g, "").trim();
  for (const prefix of CALLOUT_PREFIXES) {
    if (trimmed.toUpperCase().startsWith(prefix)) {
      return {
        type: prefix.slice(0, -1),
        body: trimmed.slice(prefix.length).trim(),
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tool 1: generate_memo_pdf
// ---------------------------------------------------------------------------
server.tool(
  "generate_memo_pdf",
  { title: z.string(), markdown: z.string() },
  async ({ title, markdown }) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      info: { Title: title, Author: "Buy-side Diligence Copilot" },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const finished = new Promise<void>((resolve) => doc.on("end", resolve));

    const pageWidth = doc.page.width;
    const ml = doc.page.margins.left;
    const mr = doc.page.margins.right;
    const contentWidth = pageWidth - ml - mr;

    // ── Cover Page ──────────────────────────────────────────────────────
    doc.moveDown(4);
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#1e293b")
      .text(title, { align: "center" });
    doc.moveDown(1);

    // Horizontal rule
    doc
      .moveTo(120, doc.y)
      .lineTo(475, doc.y)
      .strokeColor("#2563eb")
      .lineWidth(2)
      .stroke();
    doc.moveDown(1.5);

    // Metadata block
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("Prepared for:", { align: "center" });
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1e293b")
      .text("Investment Committee", { align: "center" });
    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("Prepared by:", { align: "center" });
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1e293b")
      .text("Buy-side Diligence Copilot", { align: "center" });
    doc.moveDown(0.5);

    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(`Date: ${formattedDate}`, { align: "center" });
    doc.moveDown(2);

    // Classification box
    const classBoxY = doc.y;
    doc.rect(ml, classBoxY, contentWidth, 30).fill("#fef2f2");
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#ef4444")
      .text(
        "CONFIDENTIAL — FOR AUTHORIZED RECIPIENTS ONLY",
        ml,
        classBoxY + 9,
        { width: contentWidth, align: "center" },
      );

    // ── Table of Contents ───────────────────────────────────────────────
    doc.addPage();
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#1e293b")
      .text("Table of Contents");
    doc.moveDown(0.5);
    doc
      .moveTo(72, doc.y)
      .lineTo(200, doc.y)
      .strokeColor("#2563eb")
      .lineWidth(1.5)
      .stroke();
    doc.moveDown(1);

    const allLines = markdown.split("\n");
    const sections = allLines
      .filter((l) => l.startsWith("## "))
      .map((l, i) => ({ num: i + 1, title: l.slice(3).trim() }));

    for (const s of sections) {
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#334155")
        .text(`${s.num}. ${s.title}`, { indent: 20 });
      doc.moveDown(0.3);
    }

    // ── Content Rendering ───────────────────────────────────────────────
    let sectionCounter = 0;
    let tableBuffer: string[][] = [];

    function flushTable() {
      if (tableBuffer.length > 0) {
        renderTable(doc, tableBuffer);
        tableBuffer = [];
      }
    }

    for (let li = 0; li < allLines.length; li++) {
      const line = allLines[li];

      // ── Section header ## ──
      if (line.startsWith("## ")) {
        flushTable();
        sectionCounter++;
        doc.addPage();
        const sectionTitle = `${sectionCounter}. ${line.slice(3).trim()}`;
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#1e293b")
          .text(sectionTitle);
        doc.moveDown(0.2);
        doc
          .moveTo(72, doc.y)
          .lineTo(250, doc.y)
          .strokeColor("#2563eb")
          .lineWidth(1.5)
          .stroke();
        doc.moveDown(0.6);
        continue;
      }

      // ── Sub-header ### ──
      if (line.startsWith("### ")) {
        flushTable();
        doc.moveDown(0.6);
        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .fillColor("#334155")
          .text(line.slice(4).trim());
        doc.moveDown(0.3);
        continue;
      }

      // ── Table rows ──
      if (line.trimStart().startsWith("|")) {
        const cells = line
          .split("|")
          .slice(1, -1) // drop leading/trailing empty
          .map((c) => c.trim());
        // Skip separator lines like |---|---|
        if (cells.length > 0 && !/^[-:\s]+$/.test(cells[0])) {
          tableBuffer.push(cells);
        }
        continue;
      }

      // If we reach a non-table line, flush any buffered table rows
      flushTable();

      const trimmed = line.trim();

      // ── Empty line ──
      if (trimmed === "") {
        doc.moveDown(0.3);
        continue;
      }

      // ── Callout boxes ──
      const callout = matchCallout(trimmed);
      if (callout) {
        renderCallout(doc, callout.type, callout.body);
        continue;
      }

      // ── Bullet points ──
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.slice(2).trim();
        doc.fontSize(10).font("Helvetica").fillColor("#334155");
        doc.text("•", { continued: true, indent: 12 });
        doc.text("  ", { continued: true });
        renderMarkdownLine(doc, bulletText, 0);
        doc.moveDown(0.2);
        continue;
      }

      // ── Numbered list (e.g. "1. ") ──
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        doc.fontSize(10).font("Helvetica").fillColor("#334155");
        doc.text(`${numberedMatch[1]}. `, { continued: true, indent: 12 });
        renderMarkdownLine(doc, numberedMatch[2], 0);
        doc.moveDown(0.2);
        continue;
      }

      // ── Standalone bold line ──
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#1e293b")
          .text(trimmed.replace(/\*\*/g, "").trim());
        doc.moveDown(0.2);
        continue;
      }

      // ── Regular paragraph ──
      doc.fontSize(10).font("Helvetica").fillColor("#334155");
      renderMarkdownLine(doc, trimmed, 0);
      doc.moveDown(0.3);
    }

    // Flush any remaining table rows
    flushTable();

    doc.end();
    await finished;

    const buffer = Buffer.concat(chunks);
    const size = writeArtifactBuffer("memo.pdf", buffer);

    const result = {
      artifactId: "memo",
      filename: "memo.pdf",
      type: "memo",
      format: "pdf",
      size,
      message: `Memo PDF generated (${size} bytes)`,
    };

    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool 2: generate_deck (.pptx via pptxgenjs)
// ---------------------------------------------------------------------------

// ── Slide-type detection ────────────────────────────────────────────────────
type SlideType = "executive" | "financial" | "table" | "comparison" | "numbered" | "standard";

function detectSlideType(title: string): SlideType {
  const t = title.toLowerCase();
  if (/executive|summary overview/i.test(t) && /summary|overview/i.test(t)) return "executive";
  if (/bull.*bear|bear.*bull|\bvs\b/i.test(t)) return "comparison";
  if (/competitive|competitor|risk\s*matrix|acquisition|m\s*&\s*a|valuation comp|comps\b/i.test(t)) return "table";
  if (/financial|revenue|margin|balance|valuation|metric|retention|cohort|unit econom|ebitda|cash\s*flow/i.test(t)) return "financial";
  if (/question|next\s*step|recommendation|action\s*item/i.test(t)) return "numbered";
  return "standard";
}

// ── Parse helpers ───────────────────────────────────────────────────────────
function parseBullets(content: string): string[] {
  return content
    .split("\n")
    .map(line => line.replace(/^[\s]*[-*•]\s+/, "").replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").trim())
    .filter(line => line.length > 0 && !/^[-|:]+$/.test(line));
}

function extractMetrics(lines: string[]): Array<{ label: string; value: string }> {
  const metrics: Array<{ label: string; value: string }> = [];
  for (const line of lines) {
    const m = line.match(/^([^:]{2,40}):\s*(.{1,35})$/);
    if (m) metrics.push({ label: m[1].trim(), value: m[2].trim() });
  }
  return metrics;
}

function parseTableData(lines: string[]): { headers: string[]; rows: string[][] } | null {
  const pipeLines = lines.filter(l => l.includes("|"));
  if (pipeLines.length >= 2) {
    const parse = (l: string) => l.split("|").map(c => c.trim()).filter(c => c.length > 0 && !/^[-:]+$/.test(c));
    const headers = parse(pipeLines[0]);
    if (headers.length === 0) return null;
    const rows = pipeLines.slice(1)
      .map(parse)
      .filter(r => r.length > 0 && r.length <= headers.length + 1);
    if (rows.length === 0) return null;
    return { headers, rows };
  }
  // Fallback: "Name - Detail" patterns (at least 3 lines with a dash separator)
  const dashLines = lines.filter(l => /\s[-–—]\s/.test(l));
  if (dashLines.length >= 3) {
    const headers = ["Item", "Details"];
    const rows = dashLines.map(l => {
      const parts = l.split(/\s[-–—]\s/);
      return [parts[0].trim(), parts.slice(1).join(" – ").trim()];
    });
    return { headers, rows };
  }
  return null;
}

function splitTwoColumns(lines: string[], splitKeyword: string): [string[], string[]] {
  const kwIdx = lines.findIndex(l => new RegExp(splitKeyword, "i").test(l));
  if (kwIdx > 0) {
    return [lines.slice(0, kwIdx), lines.slice(kwIdx + 1)];
  }
  const mid = Math.ceil(lines.length / 2);
  return [lines.slice(0, mid), lines.slice(mid)];
}

function severityColor(text: string): string {
  if (/\bhigh\b/i.test(text)) return "ef4444";
  if (/\b(moderate|medium)\b/i.test(text)) return "f59e0b";
  if (/\blow\b/i.test(text)) return "22c55e";
  return "334155";
}

// ── Main tool ───────────────────────────────────────────────────────────────
server.tool(
  "generate_deck",
  {
    title: z.string(),
    slides: z.array(z.object({ title: z.string(), content: z.string() })),
  },
  async ({ title, slides }) => {
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.title = title;
    pptx.author = "Buy-side Diligence Copilot";
    pptx.company = "Diligence Agent Harness";

    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Color palette
    const DARK = "1e293b";
    const MID = "334155";
    const LIGHT = "64748b";
    const ACCENT = "2563eb";
    const WHITE = "ffffff";
    const SLATE_50 = "f8fafc";
    const SLATE_200 = "e2e8f0";
    const RED = "ef4444";
    const GREEN = "22c55e";

    // ── Slide master (all content slides) ─────────────────────────────────
    pptx.defineSlideMaster({
      title: "IC_MASTER",
      background: { fill: WHITE },
      objects: [
        { rect: { x: 0, y: 0, w: "100%", h: 0.03, fill: { color: ACCENT } } },
        { rect: { x: 0, y: 7.0, w: "100%", h: 0.5, fill: { color: DARK } } },
        { text: { text: "CONFIDENTIAL", options: { x: 0.4, y: 7.08, w: 2, h: 0.3, fontSize: 7, color: RED, fontFace: "Arial", bold: true } } },
        { text: { text: "Buy-Side Due Diligence", options: { x: 3.5, y: 7.08, w: 6, h: 0.3, fontSize: 7, color: "94a3b8", fontFace: "Arial", align: "center" } } },
      ],
    });

    // ── Helpers to add common elements ─────────────────────────────────────
    function addSlideTitle(slide: PptxGenJS.Slide, text: string) {
      slide.addText(text, {
        x: 0.4, y: 0.2, w: 12, h: 0.55,
        fontSize: 20, color: DARK, fontFace: "Arial", bold: true,
      });
      slide.addShape("rect" as PptxGenJS.ShapeType, {
        x: 0.4, y: 0.78, w: 1.5, h: 0.03, fill: { color: ACCENT },
      });
    }

    function addSlideNumber(slide: PptxGenJS.Slide, num: number) {
      slide.addText(String(num), {
        x: 12.2, y: 7.08, w: 0.8, h: 0.3,
        fontSize: 7, color: "94a3b8", fontFace: "Arial", align: "right",
      });
    }

    // =====================================================================
    //  1. TITLE SLIDE  (dark, no master)
    // =====================================================================
    const titleSlide = pptx.addSlide();
    titleSlide.background = { fill: DARK };
    titleSlide.addShape("rect" as PptxGenJS.ShapeType, {
      x: 1.5, y: 1.8, w: 10.3, h: 0.04, fill: { color: ACCENT },
    });
    titleSlide.addText(title, {
      x: 1, y: 2.0, w: 11.33, h: 1.2,
      fontSize: 32, color: WHITE, fontFace: "Arial", bold: true, align: "center",
    });
    titleSlide.addText("Investment Committee Presentation", {
      x: 1, y: 3.3, w: 11.33, h: 0.6,
      fontSize: 16, color: LIGHT, fontFace: "Arial", align: "center",
    });
    titleSlide.addShape("rect" as PptxGenJS.ShapeType, {
      x: 5.2, y: 4.2, w: 3, h: 0.02, fill: { color: LIGHT },
    });
    titleSlide.addText([
      { text: "Prepared by  ", options: { fontSize: 10, color: LIGHT } },
      { text: "Diligence Agent Harness", options: { fontSize: 10, color: WHITE, bold: true } },
    ], { x: 1, y: 4.5, w: 11.33, h: 0.4, fontFace: "Arial", align: "center" });
    titleSlide.addText(now, {
      x: 1, y: 5.0, w: 11.33, h: 0.4,
      fontSize: 11, color: LIGHT, fontFace: "Arial", align: "center",
    });
    titleSlide.addText("CONFIDENTIAL — FOR INTERNAL USE ONLY", {
      x: 1, y: 6.5, w: 11.33, h: 0.3,
      fontSize: 9, color: RED, fontFace: "Arial", align: "center", bold: true,
    });

    // =====================================================================
    //  CONTENT SLIDES
    // =====================================================================
    for (let i = 0; i < slides.length; i++) {
      const sd = slides[i];
      const slideType = detectSlideType(sd.title);
      const slide = pptx.addSlide({ masterName: "IC_MASTER" });
      const contentLines = sd.content.split("\n").map(l => l.trim()).filter(l => l.length > 0 && !/^[-|:]+$/.test(l));
      const bullets = parseBullets(sd.content);
      const slideNum = i + 2; // title slide is 1

      addSlideTitle(slide, sd.title);
      addSlideNumber(slide, slideNum);

      // ── EXECUTIVE SUMMARY ─────────────────────────────────────────────
      if (slideType === "executive") {
        // Partition bullets: positive → highlights, risk/negative → risks
        const riskKeywords = /risk|concern|challeng|threat|weak|declin|negativ|issue|loss|churn|uncertain|disadvantage|bear/i;
        const highlights: string[] = [];
        const risks: string[] = [];
        let inRiskSection = false;
        for (const b of bullets) {
          if (/key\s*risk|risk/i.test(b) && b.length < 30) { inRiskSection = true; continue; }
          if (/key\s*highlight|highlight|strength/i.test(b) && b.length < 30) { inRiskSection = false; continue; }
          if (inRiskSection || riskKeywords.test(b)) { risks.push(b); } else { highlights.push(b); }
        }
        if (risks.length === 0) {
          const mid = Math.ceil(bullets.length / 2);
          highlights.length = 0;
          highlights.push(...bullets.slice(0, mid));
          risks.push(...bullets.slice(mid));
        }

        // Left: KEY HIGHLIGHTS
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 0.4, y: 1.05, w: 5.8, h: 0.35, fill: { color: GREEN } });
        slide.addText("KEY HIGHLIGHTS", { x: 0.4, y: 1.05, w: 5.8, h: 0.35, fontSize: 10, color: WHITE, fontFace: "Arial", bold: true, align: "center" });
        if (highlights.length > 0) {
          slide.addText(
            highlights.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
            { x: 0.5, y: 1.55, w: 5.6, h: 4.5, fontSize: 11, color: MID, fontFace: "Arial", lineSpacingMultiple: 1.4, valign: "top" },
          );
        }

        // Vertical divider
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 6.55, y: 1.05, w: 0.015, h: 5.0, fill: { color: SLATE_200 } });

        // Right: KEY RISKS
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 6.9, y: 1.05, w: 5.8, h: 0.35, fill: { color: RED } });
        slide.addText("KEY RISKS", { x: 6.9, y: 1.05, w: 5.8, h: 0.35, fontSize: 10, color: WHITE, fontFace: "Arial", bold: true, align: "center" });
        if (risks.length > 0) {
          slide.addText(
            risks.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
            { x: 7.0, y: 1.55, w: 5.6, h: 4.5, fontSize: 11, color: MID, fontFace: "Arial", lineSpacingMultiple: 1.4, valign: "top" },
          );
        }

        // Bottom: OVERALL ASSESSMENT bar
        const assessmentLine = bullets.find(b => /overall|verdict|recommendation|assessment/i.test(b));
        const assessmentText = assessmentLine ?? "See detailed analysis in subsequent slides.";
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 0.4, y: 6.15, w: 12.5, h: 0.6, fill: { color: SLATE_50 }, line: { color: SLATE_200, width: 0.5 } });
        slide.addText([
          { text: "OVERALL ASSESSMENT:  ", options: { bold: true, fontSize: 9, color: ACCENT } },
          { text: assessmentText, options: { fontSize: 9, color: MID } },
        ], { x: 0.6, y: 6.2, w: 12.1, h: 0.5, fontFace: "Arial", valign: "middle" });

      // ── FINANCIAL / METRICS ───────────────────────────────────────────
      } else if (slideType === "financial") {
        const metrics = extractMetrics(bullets);
        const detailBullets = bullets.filter(b => !b.match(/^[^:]{2,40}:\s*.{1,35}$/));

        if (metrics.length >= 2) {
          const display = metrics.slice(0, 4);
          const boxW = 2.8;
          const gap = 0.3;
          const totalW = display.length * boxW + (display.length - 1) * gap;
          const startX = (13.33 - totalW) / 2;

          display.forEach((m, idx) => {
            const bx = startX + idx * (boxW + gap);
            slide.addShape("roundRect" as PptxGenJS.ShapeType, {
              x: bx, y: 0.9, w: boxW, h: 1.2,
              fill: { color: SLATE_50 }, line: { color: SLATE_200, width: 1 }, rectRadius: 0.06,
            });
            slide.addText(m.label, {
              x: bx + 0.15, y: 0.95, w: boxW - 0.3, h: 0.3,
              fontSize: 9, color: LIGHT, fontFace: "Arial",
            });
            slide.addText(m.value, {
              x: bx + 0.15, y: 1.25, w: boxW - 0.3, h: 0.6,
              fontSize: 24, color: DARK, fontFace: "Arial", bold: true,
            });
          });
        }

        if (detailBullets.length > 0) {
          const bulletY = metrics.length >= 2 ? 2.4 : 1.1;
          slide.addText(
            detailBullets.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
            { x: 0.5, y: bulletY, w: 12.3, h: 6.5 - bulletY, fontSize: 11, color: MID, fontFace: "Arial", lineSpacingMultiple: 1.4, valign: "top" },
          );
        }

      // ── TABLE SLIDES ──────────────────────────────────────────────────
      } else if (slideType === "table") {
        const tableData = parseTableData(contentLines);
        if (tableData) {
          const headerRow: PptxGenJS.TableRow = tableData.headers.map(h => ({
            text: h,
            options: { bold: true, fill: { color: DARK }, color: WHITE, fontSize: 9, fontFace: "Arial" as const },
          }));
          const dataRows: PptxGenJS.TableRow[] = tableData.rows.map((r, rIdx) => {
            const rowFill = rIdx % 2 === 0 ? WHITE : SLATE_50;
            return r.map(cell => {
              const cellColor = severityColor(cell);
              return {
                text: cell,
                options: {
                  fill: { color: rowFill },
                  fontSize: 9,
                  fontFace: "Arial" as const,
                  color: cellColor,
                  bold: cellColor !== MID,
                },
              };
            });
          });
          // Normalise column count
          const colCount = tableData.headers.length;
          const normRows = dataRows.map(r => {
            while (r.length < colCount) r.push({ text: "", options: { fill: { color: WHITE }, fontSize: 9, fontFace: "Arial" as const, color: MID, bold: false } });
            return r.slice(0, colCount);
          });
          const colW = Array(colCount).fill(12.5 / colCount) as number[];
          slide.addTable([headerRow, ...normRows], {
            x: 0.4, y: 1.2, w: 12.5,
            border: { type: "solid", color: SLATE_200, pt: 0.5 },
            colW,
            rowH: [0.4, ...Array(normRows.length).fill(0.35) as number[]],
            autoPage: true,
            autoPageRepeatHeader: true,
          });
        } else {
          // Fallback to bullet rendering if no table structure found
          slide.addText(
            bullets.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
            { x: 0.5, y: 1.1, w: 12.3, h: 5.5, fontSize: 12, color: MID, fontFace: "Arial", lineSpacingMultiple: 1.4, valign: "top" },
          );
        }

      // ── TWO-COLUMN COMPARISON (Bull vs Bear) ──────────────────────────
      } else if (slideType === "comparison") {
        const [leftBullets, rightBullets] = splitTwoColumns(bullets, "bear");
        const leftLabel = /bull/i.test(sd.title) ? "BULL CASE" : "STRENGTHS";
        const rightLabel = /bear/i.test(sd.title) ? "BEAR CASE" : "WEAKNESSES";

        // Left column
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 0.4, y: 1.05, w: 5.8, h: 0.35, fill: { color: GREEN } });
        slide.addText(leftLabel, { x: 0.4, y: 1.05, w: 5.8, h: 0.35, fontSize: 10, color: WHITE, fontFace: "Arial", bold: true, align: "center" });
        if (leftBullets.length > 0) {
          slide.addText(
            leftBullets.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
            { x: 0.5, y: 1.55, w: 5.6, h: 5.0, fontSize: 11, color: MID, fontFace: "Arial", lineSpacingMultiple: 1.4, valign: "top" },
          );
        }

        // Vertical divider
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 6.55, y: 1.05, w: 0.015, h: 5.5, fill: { color: SLATE_200 } });

        // Right column
        slide.addShape("rect" as PptxGenJS.ShapeType, { x: 6.9, y: 1.05, w: 5.8, h: 0.35, fill: { color: RED } });
        slide.addText(rightLabel, { x: 6.9, y: 1.05, w: 5.8, h: 0.35, fontSize: 10, color: WHITE, fontFace: "Arial", bold: true, align: "center" });
        if (rightBullets.length > 0) {
          slide.addText(
            rightBullets.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
            { x: 7.0, y: 1.55, w: 5.6, h: 5.0, fontSize: 11, color: MID, fontFace: "Arial", lineSpacingMultiple: 1.4, valign: "top" },
          );
        }

      // ── NUMBERED LIST (Questions / Next Steps / Recommendations) ──────
      } else if (slideType === "numbered") {
        const items = bullets.filter(b => !/^(key\s*)?question|next\s*step|recommendation/i.test(b) || b.length > 40);
        items.slice(0, 8).forEach((item, idx) => {
          const yPos = 1.1 + idx * 0.7;
          // Number circle
          slide.addShape("ellipse" as PptxGenJS.ShapeType, {
            x: 0.4, y: yPos, w: 0.4, h: 0.4, fill: { color: ACCENT },
          });
          slide.addText(String(idx + 1), {
            x: 0.4, y: yPos, w: 0.4, h: 0.4,
            fontSize: 14, color: WHITE, fontFace: "Arial", bold: true, align: "center", valign: "middle",
          });
          // Card background
          slide.addShape("roundRect" as PptxGenJS.ShapeType, {
            x: 1.0, y: yPos, w: 11.5, h: 0.55,
            fill: { color: SLATE_50 }, line: { color: SLATE_200, width: 0.5 }, rectRadius: 0.04,
          });
          slide.addText(item, {
            x: 1.15, y: yPos + 0.05, w: 11.2, h: 0.45,
            fontSize: 12, color: MID, fontFace: "Arial", valign: "middle",
          });
        });

      // ── STANDARD CONTENT (default) ────────────────────────────────────
      } else {
        slide.addText(
          bullets.map(b => ({ text: b, options: { bullet: { code: "2022" }, breakLine: true } as PptxGenJS.TextPropsOptions })),
          {
            x: 0.5, y: 1.1, w: 12.3, h: 5.5,
            fontSize: 12, color: MID, fontFace: "Arial",
            lineSpacingMultiple: 1.4, valign: "top",
          },
        );
      }
    }

    // =====================================================================
    //  END SLIDE
    // =====================================================================
    const endSlide = pptx.addSlide();
    endSlide.background = { fill: DARK };
    endSlide.addShape("rect" as PptxGenJS.ShapeType, {
      x: 4.2, y: 2.8, w: 5, h: 0.03, fill: { color: ACCENT },
    });
    endSlide.addText("Thank You", {
      x: 1, y: 2.9, w: 11.33, h: 0.8,
      fontSize: 28, color: WHITE, fontFace: "Arial", bold: true, align: "center",
    });
    endSlide.addText("Questions & Discussion", {
      x: 1, y: 3.8, w: 11.33, h: 0.5,
      fontSize: 14, color: LIGHT, fontFace: "Arial", align: "center",
    });
    endSlide.addText("CONFIDENTIAL — FOR INTERNAL USE ONLY", {
      x: 1, y: 6.5, w: 11.33, h: 0.3,
      fontSize: 9, color: RED, fontFace: "Arial", align: "center", bold: true,
    });

    // Write .pptx file
    ensureDir();
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    const filePath = path.join(ARTIFACTS_DIR, "deck.pptx");
    fs.writeFileSync(filePath, buffer);
    const size = buffer.length;

    const result = {
      artifactId: "deck",
      filename: "deck.pptx",
      type: "deck",
      format: "pptx",
      size,
      message: `Summary deck generated (${size} bytes)`,
    };

    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool 3: generate_dashboard
// ---------------------------------------------------------------------------
server.tool(
  "generate_dashboard",
  {
    title: z.string(),
    kpis: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        trend: z.string(),
        status: z.string(),
      }),
    ),
    revenueBreakdown: z.record(z.string(), z.number()),
    issuesSummary: z.array(
      z.object({
        title: z.string(),
        severity: z.string(),
        workstream: z.string(),
      }),
    ),
    concentrationData: z.record(z.string(), z.number()),
  },
  async ({ title, kpis, revenueBreakdown, issuesSummary, concentrationData }) => {
    const dashboardData = {
      title,
      generatedAt: new Date().toISOString(),
      kpis,
      revenueBreakdown,
      issuesSummary,
      concentrationData,
    };

    const json = JSON.stringify(dashboardData, null, 2);
    const size = writeArtifact("dashboard-data.json", json);

    return { content: [{ type: "text", text: JSON.stringify({
      artifactId: "dashboard",
      filename: "dashboard-data.json",
      type: "dashboard",
      format: "json",
      size,
      message: `Dashboard data generated (${size} bytes)`,
    }) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool 4: list_artifacts
// ---------------------------------------------------------------------------
server.tool("list_artifacts", {}, async () => {
  ensureDir();
  try {
    const files = fs.readdirSync(ARTIFACTS_DIR)
      .filter(f => f.endsWith(".html") || f.endsWith(".md") || f.endsWith(".pptx") || f.endsWith(".pdf") || f.endsWith(".json"));
    const artifacts = files.map(filename => {
      const filePath = path.join(ARTIFACTS_DIR, filename);
      const stats = fs.statSync(filePath);
      return { filename, size: stats.size, createdAt: stats.mtime.toISOString() };
    });
    return { content: [{ type: "text", text: JSON.stringify({ artifacts }) }] };
  } catch {
    return { content: [{ type: "text", text: JSON.stringify({ artifacts: [] }) }] };
  }
});

// ---------------------------------------------------------------------------
// HTML escape helper
// ---------------------------------------------------------------------------
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
startStdioServer(server);
