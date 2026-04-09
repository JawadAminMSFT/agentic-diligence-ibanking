import { describe, it, expect } from "vitest";
import {
  toolRegistry,
  getToolEntry,
  getToolTier,
} from "../src/tools/registry.js";

describe("Tool Registry", () => {
  it("has all expected tools registered", () => {
    const expectedTools = [
      "web_research.search",
      "web_research.fetch_page",
      "web_research.summarise",
      "vdr.list_documents",
      "vdr.read_document",
      "vdr.search",
      "finance.extract_kpis",
      "finance.build_revenue_bridge",
      "finance.analyse_retention",
      "finance.detect_anomalies",
      "workflow.create_issue",
      "workflow.resolve_contradiction",
      "workflow.list_issues",
      "workflow.draft_seller_question",
      "memo.read_section",
      "memo.write_section",
      "memo.list_sections",
    ];

    const registeredNames = toolRegistry.map((t) => t.name);
    for (const name of expectedTools) {
      expect(registeredNames).toContain(name);
    }
  });

  it("tier assignments are correct", () => {
    // Tier 0: read/search operations
    expect(getToolTier("web_research.search")).toBe(0);
    expect(getToolTier("vdr.list_documents")).toBe(0);
    expect(getToolTier("finance.extract_kpis")).toBe(0);
    expect(getToolTier("workflow.list_issues")).toBe(0);
    expect(getToolTier("memo.read_section")).toBe(0);

    // Tier 1: log-and-proceed
    expect(getToolTier("workflow.create_issue")).toBe(1);
    expect(getToolTier("workflow.resolve_contradiction")).toBe(1);
    expect(getToolTier("memo.write_section")).toBe(1);

    // Tier 2: human approval required
    expect(getToolTier("workflow.draft_seller_question")).toBe(2);
  });

  it("can look up tool by name", () => {
    const entry = getToolEntry("vdr.read_document");
    expect(entry).toBeDefined();
    expect(entry!.name).toBe("vdr.read_document");
    expect(entry!.mcpServer).toBe("vdr");
    expect(entry!.tier).toBe(0);
    expect(entry!.description).toBeTruthy();
  });

  it("returns undefined for unknown tool", () => {
    expect(getToolEntry("nonexistent.tool")).toBeUndefined();
  });

  it("unknown tools default to tier 0", () => {
    expect(getToolTier("nonexistent.tool")).toBe(0);
  });

  it("tool names follow server.action naming convention", () => {
    for (const tool of toolRegistry) {
      expect(tool.name).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
  });
});
