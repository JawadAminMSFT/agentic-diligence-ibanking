import { z } from "zod";
import PptxGenJS from "pptxgenjs";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
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
      info: { Title: title, Author: "Diligence Copilot" },
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
      .text("Diligence Copilot", { align: "center" });
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

// ── Color constants ─────────────────────────────────────────────────────────
const C = {
  DARK: "1e293b",
  MID: "334155",
  LIGHT: "64748b",
  MUTED: "94a3b8",
  ACCENT: "2563eb",
  WHITE: "ffffff",
  BG: "f8fafc",
  BORDER: "e2e8f0",
  RED: "dc2626",
  GREEN: "16a34a",
  AMBER: "d97706",
  RED_BG: "fef2f2",
  GREEN_BG: "f0fdf4",
  AMBER_BG: "fffbeb",
};

// ── Slide-type detection ────────────────────────────────────────────────────
type SlideType = "executive" | "financial" | "issues" | "recommendation" | "standard";

function detectSlideType(title: string): SlideType {
  const t = title.toLowerCase();
  if (/executive|summary/i.test(t) && /summary|overview/i.test(t)) return "executive";
  if (/financial|revenue|margin|retention|cohort|unit econom|ebitda|cash\s*flow|valuation|metric/i.test(t)) return "financial";
  if (/issue|risk|concern|threat/i.test(t)) return "issues";
  if (/recommend|next\s*step|action\s*item|question/i.test(t)) return "recommendation";
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

// ── Card-based bullet layout (core visual pattern) ──────────────────────────
function renderBulletCards(slide: any, bullets: string[], startY: number) {
  const colW = 4.4;
  const cardH = 0.7;
  const gap = 0.15;
  const leftX = 0.3;
  const rightX = 5.2;

  for (let i = 0; i < bullets.length && i < 10; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? leftX : rightX;
    const y = startY + row * (cardH + gap);

    // Card background
    slide.addShape("roundRect" as any, {
      x, y, w: colW, h: cardH,
      fill: { color: C.BG },
      line: { color: C.BORDER, width: 0.5 },
      rectRadius: 0.04,
    });
    // Bullet dot
    slide.addShape("ellipse" as any, {
      x: x + 0.15, y: y + cardH / 2 - 0.05, w: 0.1, h: 0.1,
      fill: { color: C.ACCENT },
    });
    // Bullet text
    slide.addText(bullets[i], {
      x: x + 0.35, y: y + 0.08, w: colW - 0.5, h: cardH - 0.16,
      fontSize: 9, color: C.MID, fontFace: "Arial",
      valign: "middle", shrinkText: true,
    });
  }
}

// ── Content slide header (dark bar + title + slide number) ──────────────────
function addContentSlideHeader(slide: any, slideTitle: string, slideNum: number) {
  slide.addText(slideTitle, {
    x: 0.3, y: 0.08, w: 8, h: 0.35,
    fontSize: 14, color: C.WHITE, fontFace: "Arial", bold: true,
  });
  slide.addText(String(slideNum), {
    x: 9.2, y: 0.08, w: 0.5, h: 0.35,
    fontSize: 9, color: C.MUTED, fontFace: "Arial", align: "right",
  });
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
    pptx.defineLayout({ name: "CUSTOM_16x9", width: 10, height: 5.625 });
    pptx.layout = "CUSTOM_16x9";
    pptx.title = title;
    pptx.author = "Diligence Copilot";
    pptx.company = "Diligence Agent Harness";

    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // ── Slide master (all content slides) ─────────────────────────────────
    pptx.defineSlideMaster({
      title: "MASTER",
      background: { fill: C.WHITE },
      objects: [
        { rect: { x: 0, y: 0, w: "100%", h: 0.5, fill: { color: C.DARK } } },
        { rect: { x: 0, y: 5.35, w: "100%", h: 0.01, fill: { color: C.BORDER } } },
        { text: { text: "CONFIDENTIAL", options: { x: 0.3, y: 5.38, w: 1.5, h: 0.2, fontSize: 6, color: C.RED, fontFace: "Arial", bold: true } } },
      ],
    });

    // =====================================================================
    //  1. TITLE SLIDE (dark, no master)
    // =====================================================================
    const titleSlide = pptx.addSlide();
    titleSlide.background = { fill: C.DARK };
    titleSlide.addText(title, {
      x: 0.8, y: 1.2, w: 8.4, h: 1.0,
      fontSize: 26, color: C.WHITE, fontFace: "Arial", bold: true,
    });
    titleSlide.addShape("rect" as any, { x: 0.8, y: 2.3, w: 2, h: 0.03, fill: { color: C.ACCENT } });
    titleSlide.addText("Investment Committee Presentation", {
      x: 0.8, y: 2.5, w: 8.4, h: 0.4,
      fontSize: 13, color: C.MUTED, fontFace: "Arial",
    });
    titleSlide.addText(`Prepared by  Diligence Copilot\n${now}`, {
      x: 0.8, y: 3.2, w: 8.4, h: 0.6,
      fontSize: 9, color: C.LIGHT, fontFace: "Arial",
    });
    titleSlide.addText("CONFIDENTIAL", {
      x: 0.8, y: 4.8, w: 8.4, h: 0.3,
      fontSize: 8, color: C.RED, fontFace: "Arial", bold: true,
    });

    // =====================================================================
    //  CONTENT SLIDES
    // =====================================================================
    for (let i = 0; i < slides.length; i++) {
      const sd = slides[i];
      const slideType = detectSlideType(sd.title);
      const slide = pptx.addSlide({ masterName: "MASTER" });
      const bullets = parseBullets(sd.content);
      const slideNum = i + 2;

      addContentSlideHeader(slide, sd.title, slideNum);

      // ── EXECUTIVE SUMMARY ─────────────────────────────────────────────
      if (slideType === "executive") {
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
          const mid = Math.ceil(bullets.length * 0.6);
          highlights.length = 0;
          highlights.push(...bullets.slice(0, mid));
          risks.push(...bullets.slice(mid));
        }

        // LEFT column: KEY HIGHLIGHTS
        const leftColX = 0.3;
        const leftColW = 4.4;
        slide.addShape("rect" as any, { x: leftColX, y: 0.65, w: leftColW, h: 0.3, fill: { color: C.GREEN } });
        slide.addText("KEY HIGHLIGHTS", { x: leftColX, y: 0.65, w: leftColW, h: 0.3, fontSize: 9, color: C.WHITE, fontFace: "Arial", bold: true, align: "center" });
        const hlCardH = 0.55;
        const hlGap = 0.1;
        for (let hi = 0; hi < highlights.length && hi < 5; hi++) {
          const hy = 1.05 + hi * (hlCardH + hlGap);
          slide.addShape("roundRect" as any, {
            x: leftColX, y: hy, w: leftColW, h: hlCardH,
            fill: { color: C.GREEN_BG }, line: { color: C.GREEN, width: 0.5 }, rectRadius: 0.04,
          });
          slide.addShape("ellipse" as any, { x: leftColX + 0.12, y: hy + hlCardH / 2 - 0.04, w: 0.08, h: 0.08, fill: { color: C.GREEN } });
          slide.addText(highlights[hi], {
            x: leftColX + 0.28, y: hy + 0.05, w: leftColW - 0.4, h: hlCardH - 0.1,
            fontSize: 8, color: C.MID, fontFace: "Arial", valign: "middle", shrinkText: true,
          });
        }

        // Vertical divider
        slide.addShape("rect" as any, { x: 4.95, y: 0.65, w: 0.01, h: 4.0, fill: { color: C.BORDER } });

        // RIGHT column: KEY RISKS
        const rightColX = 5.2;
        const rightColW = 4.4;
        slide.addShape("rect" as any, { x: rightColX, y: 0.65, w: rightColW, h: 0.3, fill: { color: C.RED } });
        slide.addText("KEY RISKS", { x: rightColX, y: 0.65, w: rightColW, h: 0.3, fontSize: 9, color: C.WHITE, fontFace: "Arial", bold: true, align: "center" });
        for (let ri = 0; ri < risks.length && ri < 5; ri++) {
          const ry = 1.05 + ri * (hlCardH + hlGap);
          slide.addShape("roundRect" as any, {
            x: rightColX, y: ry, w: rightColW, h: hlCardH,
            fill: { color: C.RED_BG }, line: { color: C.RED, width: 0.5 }, rectRadius: 0.04,
          });
          slide.addShape("ellipse" as any, { x: rightColX + 0.12, y: ry + hlCardH / 2 - 0.04, w: 0.08, h: 0.08, fill: { color: C.RED } });
          slide.addText(risks[ri], {
            x: rightColX + 0.28, y: ry + 0.05, w: rightColW - 0.4, h: hlCardH - 0.1,
            fontSize: 8, color: C.MID, fontFace: "Arial", valign: "middle", shrinkText: true,
          });
        }

        // Bottom: OVERALL ASSESSMENT bar
        const assessmentLine = bullets.find(b => /overall|verdict|recommendation|assessment/i.test(b));
        const assessmentText = assessmentLine ?? "See detailed analysis in subsequent slides.";
        slide.addShape("roundRect" as any, {
          x: 0.3, y: 4.7, w: 9.3, h: 0.5,
          fill: { color: C.BG }, line: { color: C.BORDER, width: 0.5 }, rectRadius: 0.04,
        });
        slide.addText([
          { text: "OVERALL ASSESSMENT:  ", options: { bold: true, fontSize: 8, color: C.ACCENT } },
          { text: assessmentText, options: { fontSize: 8, color: C.MID } },
        ], { x: 0.5, y: 4.75, w: 8.9, h: 0.4, fontFace: "Arial", valign: "middle" });

      // ── FINANCIAL / METRICS ───────────────────────────────────────────
      } else if (slideType === "financial") {
        const metrics = extractMetrics(bullets);
        const detailBullets = bullets.filter(b => !b.match(/^[^:]{2,40}:\s*.{1,35}$/));

        // KPI cards row
        if (metrics.length >= 2) {
          const display = metrics.slice(0, 3);
          const kpiW = 2.8;
          const kpiGap = 0.3;
          const totalW = display.length * kpiW + (display.length - 1) * kpiGap;
          const kpiStartX = (10 - totalW) / 2;

          display.forEach((m, idx) => {
            const bx = kpiStartX + idx * (kpiW + kpiGap);
            slide.addShape("roundRect" as any, {
              x: bx, y: 0.65, w: kpiW, h: 0.9,
              fill: { color: C.BG }, line: { color: C.BORDER, width: 0.5 }, rectRadius: 0.06,
            });
            slide.addText(m.label, {
              x: bx + 0.15, y: 0.7, w: kpiW - 0.3, h: 0.25,
              fontSize: 8, color: C.MUTED, fontFace: "Arial",
            });
            slide.addText(m.value, {
              x: bx + 0.15, y: 0.95, w: kpiW - 0.3, h: 0.5,
              fontSize: 20, color: C.DARK, fontFace: "Arial", bold: true,
            });
          });
        }

        // Remaining bullets as cards
        if (detailBullets.length > 0) {
          const bulletY = metrics.length >= 2 ? 1.75 : 0.65;
          renderBulletCards(slide, detailBullets, bulletY);
        }

      // ── ISSUES / RISK SLIDES ──────────────────────────────────────────
      } else if (slideType === "issues") {
        const cardH = 0.65;
        const gap = 0.12;
        const cardW = 9.0;
        const cardX = 0.3;

        for (let bi = 0; bi < bullets.length && bi < 6; bi++) {
          const y = 0.65 + bi * (cardH + gap);
          const text = bullets[bi];

          // Determine severity
          let sevColor = C.AMBER;
          let sevBg = C.AMBER_BG;
          let sevLabel = "MEDIUM";
          if (/\bhigh\b/i.test(text)) { sevColor = C.RED; sevBg = C.RED_BG; sevLabel = "HIGH"; }
          else if (/\blow\b/i.test(text)) { sevColor = C.GREEN; sevBg = C.GREEN_BG; sevLabel = "LOW"; }

          // Card background
          slide.addShape("roundRect" as any, {
            x: cardX, y, w: cardW, h: cardH,
            fill: { color: sevBg }, line: { color: C.BORDER, width: 0.5 }, rectRadius: 0.04,
          });
          // Severity left bar
          slide.addShape("rect" as any, {
            x: cardX, y, w: 0.06, h: cardH,
            fill: { color: sevColor },
          });
          // Severity badge
          slide.addShape("roundRect" as any, {
            x: cardX + 0.2, y: y + 0.08, w: 0.6, h: 0.2,
            fill: { color: sevColor }, rectRadius: 0.04,
          });
          slide.addText(sevLabel, {
            x: cardX + 0.2, y: y + 0.08, w: 0.6, h: 0.2,
            fontSize: 6, color: C.WHITE, fontFace: "Arial", bold: true, align: "center", valign: "middle",
          });
          // Bullet text
          slide.addText(text, {
            x: cardX + 0.95, y: y + 0.05, w: cardW - 1.1, h: cardH - 0.1,
            fontSize: 9, color: C.MID, fontFace: "Arial", valign: "middle", shrinkText: true,
          });
        }

      // ── RECOMMENDATION / NEXT STEPS ───────────────────────────────────
      } else if (slideType === "recommendation") {
        const items = bullets.filter(b => !/^(key\s*)?question|next\s*step|recommendation/i.test(b) || b.length > 40);
        const cardH = 0.65;
        const gap = 0.12;

        for (let ni = 0; ni < items.length && ni < 6; ni++) {
          const y = 0.65 + ni * (cardH + gap);

          // Numbered circle
          slide.addShape("ellipse" as any, {
            x: 0.3, y: y + 0.1, w: 0.4, h: 0.4,
            fill: { color: C.ACCENT },
          });
          slide.addText(String(ni + 1), {
            x: 0.3, y: y + 0.1, w: 0.4, h: 0.4,
            fontSize: 13, color: C.WHITE, fontFace: "Arial", bold: true, align: "center", valign: "middle",
          });
          // Card background
          slide.addShape("roundRect" as any, {
            x: 0.85, y, w: 8.75, h: cardH,
            fill: { color: C.BG }, line: { color: C.BORDER, width: 0.5 }, rectRadius: 0.04,
          });
          slide.addText(items[ni], {
            x: 1.0, y: y + 0.05, w: 8.45, h: cardH - 0.1,
            fontSize: 9, color: C.MID, fontFace: "Arial", valign: "middle", shrinkText: true,
          });
        }

      // ── STANDARD CONTENT (default — two-column cards) ─────────────────
      } else {
        renderBulletCards(slide, bullets, 0.65);
      }
    }

    // =====================================================================
    //  END SLIDE
    // =====================================================================
    const endSlide = pptx.addSlide();
    endSlide.background = { fill: C.DARK };
    endSlide.addShape("rect" as any, { x: 3.5, y: 1.8, w: 3, h: 0.03, fill: { color: C.ACCENT } });
    endSlide.addText("Questions & Discussion", {
      x: 1, y: 2.0, w: 8, h: 0.6,
      fontSize: 22, color: C.WHITE, fontFace: "Arial", bold: true, align: "center",
    });
    endSlide.addText("CONFIDENTIAL", {
      x: 1, y: 4.5, w: 8, h: 0.3,
      fontSize: 8, color: C.RED, fontFace: "Arial", align: "center",
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
    modelComparison: z.array(z.object({
      metric: z.string(),
      managementClaim: z.string(),
      verifiedValue: z.string(),
      delta: z.string(),
      status: z.string(),
    })).optional(),
  },
  async ({ title, kpis, revenueBreakdown, issuesSummary, concentrationData, modelComparison }) => {
    const dashboardData = {
      title,
      generatedAt: new Date().toISOString(),
      kpis,
      revenueBreakdown,
      issuesSummary,
      concentrationData,
      ...(modelComparison ? { modelComparison } : {}),
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
// Tool 5: generate_model (.xlsx via exceljs)
// ---------------------------------------------------------------------------

const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1e293b" } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const ALT_ROW_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE2E8F0" } },
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
  left: { style: "thin", color: { argb: "FFE2E8F0" } },
  right: { style: "thin", color: { argb: "FFE2E8F0" } },
};

const STATUS_FILLS: Record<string, ExcelJS.Fill> = {
  confirmed: { type: "pattern", pattern: "solid", fgColor: { argb: "FFdcfce7" } },
  discrepancy: { type: "pattern", pattern: "solid", fgColor: { argb: "FFfecaca" } },
  partial: { type: "pattern", pattern: "solid", fgColor: { argb: "FFfef3c7" } },
  unverified: { type: "pattern", pattern: "solid", fgColor: { argb: "FFf1f5f9" } },
};

function applyHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = BORDER;
  });
}

function applyDataRow(row: ExcelJS.Row, index: number) {
  row.eachCell((cell) => {
    if (index % 2 === 1) cell.fill = ALT_ROW_FILL;
    cell.border = BORDER;
  });
}

server.tool(
  "generate_model",
  {
    title: z.string(),
    assumptions: z.array(z.object({
      metric: z.string(),
      managementClaim: z.string(),
      verifiedValue: z.string(),
      delta: z.string(),
      status: z.string(),
    })),
    revenueModel: z.object({
      periods: z.array(z.string()),
      revenue: z.array(z.number()),
      growthRate: z.array(z.number()),
      costOfRevenue: z.array(z.number()),
      grossProfit: z.array(z.number()),
      grossMargin: z.array(z.number()),
    }),
    scenarios: z.array(z.object({
      name: z.string(),
      description: z.string(),
      keyAssumptions: z.string(),
      projectedRevenue: z.string(),
      projectedMargin: z.string(),
      impliedValuation: z.string(),
    })),
    issues: z.array(z.object({
      title: z.string(),
      financialImpact: z.string(),
      adjustment: z.string(),
    })),
  },
  async ({ title, assumptions, revenueModel, scenarios, issues }) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Diligence Agent";
    workbook.created = new Date();

    // ---- Sheet 1: Summary ----
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.mergeCells("A1:D1");
    const titleCell = summarySheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { bold: true, size: 18, color: { argb: "FF1e293b" } };
    titleCell.alignment = { vertical: "middle" };
    summarySheet.getRow(1).height = 36;

    summarySheet.getCell("A3").value = "Date:";
    summarySheet.getCell("B3").value = new Date().toISOString().split("T")[0];
    summarySheet.getCell("A4").value = "Deal:";
    summarySheet.getCell("B4").value = title;
    summarySheet.getCell("A5").value = "CONFIDENTIAL";
    summarySheet.getCell("A5").font = { bold: true, color: { argb: "FFDC2626" } };

    summarySheet.getRow(7).values = ["Metric", "Value", "Source", "Status"];
    applyHeaderRow(summarySheet.getRow(7));
    assumptions.forEach((a, i) => {
      const row = summarySheet.getRow(8 + i);
      row.values = [a.metric, a.verifiedValue, a.managementClaim, a.status];
      applyDataRow(row, i);
      const statusCell = row.getCell(4);
      if (STATUS_FILLS[a.status]) statusCell.fill = STATUS_FILLS[a.status];
    });

    summarySheet.columns = [
      { key: "A", width: 30 },
      { key: "B", width: 25 },
      { key: "C", width: 25 },
      { key: "D", width: 18 },
    ];

    // ---- Sheet 2: Revenue Model ----
    const revenueSheet = workbook.addWorksheet("Revenue Model");
    const periodHeaders = ["Metric", ...revenueModel.periods];
    revenueSheet.getRow(1).values = periodHeaders;
    applyHeaderRow(revenueSheet.getRow(1));
    revenueSheet.views = [{ state: "frozen" as const, ySplit: 1, xSplit: 1 }];

    const revenueRows: { label: string; data: number[]; fmt: string }[] = [
      { label: "Revenue", data: revenueModel.revenue, fmt: "$#,##0" },
      { label: "Growth Rate", data: revenueModel.growthRate, fmt: "0.0%" },
      { label: "Cost of Revenue", data: revenueModel.costOfRevenue, fmt: "$#,##0" },
      { label: "Gross Profit", data: revenueModel.grossProfit, fmt: "$#,##0" },
      { label: "Gross Margin", data: revenueModel.grossMargin, fmt: "0.0%" },
    ];

    revenueRows.forEach((item, i) => {
      const row = revenueSheet.getRow(2 + i);
      row.values = [item.label, ...item.data];
      applyDataRow(row, i);
      for (let c = 2; c <= 1 + item.data.length; c++) {
        row.getCell(c).numFmt = item.fmt;
      }
    });

    revenueSheet.columns = [
      { key: "A", width: 20 },
      ...revenueModel.periods.map(() => ({ width: 16 })),
    ];

    // ---- Sheet 3: Assumptions & Verification ----
    const assumptionsSheet = workbook.addWorksheet("Assumptions & Verification");
    assumptionsSheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Management Claim", key: "managementClaim", width: 28 },
      { header: "Verified Value", key: "verifiedValue", width: 28 },
      { header: "Delta", key: "delta", width: 20 },
      { header: "Status", key: "status", width: 18 },
    ];
    applyHeaderRow(assumptionsSheet.getRow(1));
    assumptionsSheet.autoFilter = { from: "A1", to: "E1" };
    assumptionsSheet.views = [{ state: "frozen" as const, ySplit: 1 }];

    assumptions.forEach((a, i) => {
      const row = assumptionsSheet.addRow(a);
      applyDataRow(row, i);
      const statusCell = row.getCell(5);
      if (STATUS_FILLS[a.status]) statusCell.fill = STATUS_FILLS[a.status];
    });

    // ---- Sheet 4: Scenario Analysis ----
    const scenarioSheet = workbook.addWorksheet("Scenario Analysis");
    scenarioSheet.columns = [
      { header: "Scenario", key: "name", width: 14 },
      { header: "Description", key: "description", width: 32 },
      { header: "Key Assumptions", key: "keyAssumptions", width: 32 },
      { header: "Projected Revenue", key: "projectedRevenue", width: 22 },
      { header: "Projected Margin", key: "projectedMargin", width: 20 },
      { header: "Implied Valuation", key: "impliedValuation", width: 22 },
    ];
    applyHeaderRow(scenarioSheet.getRow(1));
    scenarioSheet.views = [{ state: "frozen" as const, ySplit: 1 }];

    const scenarioFills: Record<string, ExcelJS.Fill> = {
      Bull: { type: "pattern", pattern: "solid", fgColor: { argb: "FFdcfce7" } },
      Bear: { type: "pattern", pattern: "solid", fgColor: { argb: "FFfecaca" } },
    };

    scenarios.forEach((s) => {
      const row = scenarioSheet.addRow(s);
      const fill = scenarioFills[s.name];
      if (fill) {
        row.eachCell((cell) => { cell.fill = fill; cell.border = BORDER; });
      } else {
        row.eachCell((cell) => { cell.border = BORDER; });
      }
    });

    // ---- Sheet 5: Issues & Adjustments ----
    const issuesSheet = workbook.addWorksheet("Issues & Adjustments");
    issuesSheet.columns = [
      { header: "Issue", key: "title", width: 36 },
      { header: "Financial Impact", key: "financialImpact", width: 30 },
      { header: "Recommended Adjustment", key: "adjustment", width: 36 },
    ];
    applyHeaderRow(issuesSheet.getRow(1));
    issuesSheet.views = [{ state: "frozen" as const, ySplit: 1 }];

    const RED_LEFT_BORDER: Partial<ExcelJS.Borders> = {
      ...BORDER,
      left: { style: "medium", color: { argb: "FFDC2626" } },
    };

    issues.forEach((issue, i) => {
      const row = issuesSheet.addRow(issue);
      applyDataRow(row, i);
      row.getCell(1).border = RED_LEFT_BORDER;
    });

    // ---- Write file ----
    ensureDir();
    const filePath = path.join(ARTIFACTS_DIR, "model.xlsx");
    await workbook.xlsx.writeFile(filePath);
    const stats = fs.statSync(filePath);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          artifactId: "model",
          filename: "model.xlsx",
          type: "model",
          format: "xlsx",
          size: stats.size,
          message: `Financial model generated (${stats.size} bytes)`,
        }),
      }],
    };
  },
);

// ---------------------------------------------------------------------------
// Tool 6: list_artifacts
// ---------------------------------------------------------------------------
server.tool("list_artifacts", {}, async () => {
  ensureDir();
  try {
    const files = fs.readdirSync(ARTIFACTS_DIR)
      .filter(f => f.endsWith(".html") || f.endsWith(".md") || f.endsWith(".pptx") || f.endsWith(".pdf") || f.endsWith(".json") || f.endsWith(".xlsx"));
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
