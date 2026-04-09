import { describe, it, expect } from "vitest";
import { WorkspaceStore } from "../../src/state/store.js";
import { TraceStore } from "../../src/events/trace-store.js";
import type { HarnessEvent, HarnessEventType } from "../../src/events/types.js";
import type {
  DealWorkspace,
  EvidenceItem,
  Claim,
  OpenIssue,
  MemoSection,
  ToolHistoryEntry,
  Contradiction,
} from "../../src/state/types.js";
import type { MutationEvent } from "../../src/state/store.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let eventSeq = 0;

function harnessEvent(
  eventType: HarnessEventType,
  summary: string,
  payload: Record<string, unknown> = {},
): HarnessEvent {
  eventSeq++;
  return {
    eventId: `evt-${eventSeq}`,
    eventType,
    timestamp: new Date().toISOString(),
    runId: "run-lifecycle",
    actorName: "lifecycle-test",
    summary,
    payload,
  };
}

function makeSeed(): DealWorkspace {
  return {
    dealId: "deal-lifecycle",
    codeName: "Project Lifecycle",
    status: "active",
    currentStage: "initial",
    dataPackageVersion: "2.0.0",
    claims: [],
    issues: [],
    memoSections: [],
    evidence: [],
    contradictions: [],
    toolHistory: [],
  };
}

function makeEvidence(
  id: string,
  source: string,
  text: string,
): EvidenceItem {
  return {
    evidenceId: id,
    sourceType: source,
    sourceId: `${source}-src`,
    locationRef: `${source}://doc1#p1`,
    extractedText: text,
    confidence: 0.85,
    linkedClaimIds: [],
    provenance: {
      provenanceId: `prov-${id}`,
      provenanceType: "public_live",
      sourceName: source,
      sourceLocator: `https://${source}.example.com/doc`,
      retrievedAt: new Date().toISOString(),
      confidence: 0.9,
    },
  };
}

function makeClaim(
  id: string,
  text: string,
  evidenceIds: string[],
): Claim {
  return {
    claimId: id,
    text,
    evidenceIds,
    status: "unresolved",
    workstream: "commercial",
  };
}

function makeIssue(id: string, title: string, evidenceIds: string[]): OpenIssue {
  return {
    issueId: id,
    title,
    description: `Issue: ${title}`,
    severity: "medium",
    workstream: "financial",
    evidenceIds,
    status: "open",
    nextAction: "investigate further",
  };
}

function makeMemo(id: string, name: string, evidenceIds: string[]): MemoSection {
  return {
    sectionId: id,
    sectionName: name,
    markdown: `# ${name}\n\nPlaceholder content.`,
    evidenceIds,
    confidence: 0.7,
    updatedBy: "agent-commercial",
  };
}

function makeToolEntry(
  toolName: string,
  success: boolean,
): ToolHistoryEntry {
  return {
    toolName,
    input: { query: "test" },
    output: { results: ["r1"] },
    timestamp: new Date().toISOString(),
    duration: 120,
    success,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("State Lifecycle Integration", () => {
  it("executes a full diligence workflow without an LLM", () => {
    const store = new WorkspaceStore(makeSeed());
    const trace = new TraceStore();
    const mutations: MutationEvent[] = [];

    // Wire store mutations → trace events
    store.onChange((mut) => {
      mutations.push(mut);
      const eventType = ({
        "evidence.upserted": "evidence.collected",
        "claim.upserted": "claim.evaluated",
        "issue.upserted": "issue.created",
        "memo.upserted": "memo.updated",
        "tool.recorded": "tool.completed",
        "contradiction.added": "contradiction.detected",
      } as const)[mut.kind] as HarnessEventType;

      trace.append(harnessEvent(eventType, `${mut.kind} fired`));
    });

    // --- Phase 1: collect evidence from multiple sources ---

    trace.append(harnessEvent("run.started", "Lifecycle run started"));

    const webEvidence = makeEvidence("ev-web-1", "web", "Revenue grew 15% YoY");
    const vdrEvidence = makeEvidence("ev-vdr-1", "vdr", "Revenue grew 12% YoY per audited financials");
    const finEvidence = makeEvidence("ev-fin-1", "finance", "Churn rate is 8% annually");

    store.upsertEvidence(webEvidence);
    store.upsertEvidence(vdrEvidence);
    store.upsertEvidence(finEvidence);
    store.addToolHistory(makeToolEntry("web_research.search", true));
    store.addToolHistory(makeToolEntry("vdr.read_document", true));
    store.addToolHistory(makeToolEntry("finance.extract_kpis", true));

    // --- Phase 2: create claims ---

    const claim1 = makeClaim("cl-rev", "Revenue grew 15% YoY", ["ev-web-1"]);
    const claim2 = makeClaim("cl-churn", "Churn rate is 8%", ["ev-fin-1"]);
    store.upsertClaim(claim1);
    store.upsertClaim(claim2);

    // --- Phase 3: detect contradiction ---

    const contradiction: Contradiction = {
      contradictionId: "con-rev",
      claimA: "cl-rev",
      claimB: "cl-rev-vdr",
      evidenceIds: ["ev-web-1", "ev-vdr-1"],
    };

    // Add a VDR-based claim that contradicts web claim
    const claimVdr = makeClaim("cl-rev-vdr", "Revenue grew 12% YoY", ["ev-vdr-1"]);
    store.upsertClaim(claimVdr);
    store.addContradiction(contradiction);

    // --- Phase 4: create issues ---

    const issue = makeIssue(
      "iss-rev-discrepancy",
      "Revenue growth discrepancy (15% vs 12%)",
      ["ev-web-1", "ev-vdr-1"],
    );
    store.upsertIssue(issue);

    // --- Phase 5: write memo sections ---

    const memoCommercial = makeMemo("sec-commercial", "Commercial Overview", [
      "ev-web-1",
      "ev-vdr-1",
    ]);
    const memoFinancial = makeMemo("sec-financial", "Financial Analysis", [
      "ev-fin-1",
    ]);
    store.upsertMemoSection(memoCommercial);
    store.upsertMemoSection(memoFinancial);

    // --- Phase 6: resolve issue & update claim ---

    store.upsertIssue({ ...issue, status: "resolved", nextAction: "none" });
    store.upsertClaim({ ...claim1, status: "contradicted" });
    store.upsertClaim({ ...claimVdr, status: "supported" });

    trace.append(harnessEvent("run.completed", "Lifecycle run completed"));

    // =======================================================================
    // Verify final workspace state
    // =======================================================================

    const ws = store.getWorkspace();

    expect(ws.dealId).toBe("deal-lifecycle");
    expect(ws.evidence).toHaveLength(3);
    expect(ws.claims).toHaveLength(3);
    expect(ws.issues).toHaveLength(1);
    expect(ws.memoSections).toHaveLength(2);
    expect(ws.contradictions).toHaveLength(1);
    expect(ws.toolHistory).toHaveLength(3);

    // Evidence from three sources
    const evidenceSources = ws.evidence.map((e) => e.sourceType);
    expect(evidenceSources).toContain("web");
    expect(evidenceSources).toContain("vdr");
    expect(evidenceSources).toContain("finance");

    // Issue was resolved
    expect(ws.issues[0].status).toBe("resolved");

    // Claims reflect contradiction resolution
    const webClaim = ws.claims.find((c) => c.claimId === "cl-rev");
    const vdrClaim = ws.claims.find((c) => c.claimId === "cl-rev-vdr");
    expect(webClaim?.status).toBe("contradicted");
    expect(vdrClaim?.status).toBe("supported");

    // Memo sections exist
    expect(ws.memoSections.map((m) => m.sectionName)).toEqual(
      expect.arrayContaining(["Commercial Overview", "Financial Analysis"]),
    );

    // Tool history tracks all operations
    const toolNames = ws.toolHistory.map((t) => t.toolName);
    expect(toolNames).toContain("web_research.search");
    expect(toolNames).toContain("vdr.read_document");
    expect(toolNames).toContain("finance.extract_kpis");

    // =======================================================================
    // Verify trace events
    // =======================================================================

    const allEvents = trace.list();
    expect(allEvents.length).toBeGreaterThanOrEqual(2);

    // First and last events are run lifecycle
    expect(allEvents[0].eventType).toBe("run.started");
    expect(allEvents[allEvents.length - 1].eventType).toBe("run.completed");

    // Should contain evidence, claim, issue, memo, and contradiction events
    const traceTypes = allEvents.map((e) => e.eventType);
    expect(traceTypes).toContain("evidence.collected");
    expect(traceTypes).toContain("claim.evaluated");
    expect(traceTypes).toContain("issue.created");
    expect(traceTypes).toContain("memo.updated");
    expect(traceTypes).toContain("contradiction.detected");
    expect(traceTypes).toContain("tool.completed");
  });

  it("mutations are tracked via onChange callbacks", () => {
    const store = new WorkspaceStore(makeSeed());
    const mutationKinds: string[] = [];

    store.onChange((mut) => mutationKinds.push(mut.kind));

    store.upsertEvidence(makeEvidence("ev-1", "web", "text"));
    store.upsertClaim(makeClaim("cl-1", "claim", ["ev-1"]));
    store.upsertIssue(makeIssue("iss-1", "issue", ["ev-1"]));
    store.upsertMemoSection(makeMemo("sec-1", "Overview", ["ev-1"]));
    store.addToolHistory(makeToolEntry("web_research.search", true));
    store.addContradiction({
      contradictionId: "con-1",
      claimA: "cl-1",
      claimB: "cl-2",
      evidenceIds: ["ev-1"],
    });

    expect(mutationKinds).toEqual([
      "evidence.upserted",
      "claim.upserted",
      "issue.upserted",
      "memo.upserted",
      "tool.recorded",
      "contradiction.added",
    ]);
  });

  it("upsert operations update existing items instead of duplicating", () => {
    const store = new WorkspaceStore(makeSeed());
    const ev = makeEvidence("ev-dup", "web", "original");

    store.upsertEvidence(ev);
    store.upsertEvidence({ ...ev, extractedText: "updated" });

    const ws = store.getWorkspace();
    expect(ws.evidence).toHaveLength(1);
    expect(ws.evidence[0].extractedText).toBe("updated");
  });

  it("trace store filters work with lifecycle data", () => {
    const trace = new TraceStore();

    trace.append(harnessEvent("run.started", "start"));
    trace.append(harnessEvent("evidence.collected", "ev"));
    trace.append(harnessEvent("claim.evaluated", "claim"));
    trace.append(harnessEvent("tool.completed", "tool"));
    trace.append(harnessEvent("run.completed", "end"));

    expect(trace.count()).toBe(5);
    expect(trace.count({ eventType: "evidence.collected" })).toBe(1);
    expect(trace.count({ runId: "run-lifecycle" })).toBe(5);

    const jsonl = trace.toJSONL();
    const lines = jsonl.split("\n");
    expect(lines).toHaveLength(5);
    expect(() => JSON.parse(lines[0])).not.toThrow();
  });

  it("workspace seed is not mutated", () => {
    const seed = makeSeed();
    const store = new WorkspaceStore(seed);

    store.upsertEvidence(makeEvidence("ev-iso", "web", "text"));
    store.upsertClaim(makeClaim("cl-iso", "claim", []));
    store.upsertIssue(makeIssue("iss-iso", "issue", []));
    store.upsertMemoSection(makeMemo("sec-iso", "Section", []));
    store.addToolHistory(makeToolEntry("vdr.search", true));
    store.addContradiction({
      contradictionId: "con-iso",
      claimA: "a",
      claimB: "b",
      evidenceIds: [],
    });

    expect(seed.evidence).toHaveLength(0);
    expect(seed.claims).toHaveLength(0);
    expect(seed.issues).toHaveLength(0);
    expect(seed.memoSections).toHaveLength(0);
    expect(seed.toolHistory).toHaveLength(0);
    expect(seed.contradictions).toHaveLength(0);
  });
});
