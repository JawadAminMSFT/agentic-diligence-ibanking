import { describe, it, expect, vi } from "vitest";
import { WorkspaceStore } from "../src/state/store.js";
import type {
  DealWorkspace,
  EvidenceItem,
  Claim,
  OpenIssue,
  MemoSection,
  ToolHistoryEntry,
  Contradiction,
} from "../src/state/types.js";

function makeSeed(overrides?: Partial<DealWorkspace>): DealWorkspace {
  return {
    dealId: "deal-1",
    codeName: "Project Alpha",
    status: "active",
    currentStage: "initial",
    dataPackageVersion: "1.0.0",
    claims: [],
    issues: [],
    memoSections: [],
    evidence: [],
    contradictions: [],
    toolHistory: [],
    ...overrides,
  };
}

function makeEvidence(id: string): EvidenceItem {
  return {
    evidenceId: id,
    sourceType: "document",
    sourceId: "src-1",
    locationRef: "page-1",
    extractedText: "sample text",
    confidence: 0.9,
    linkedClaimIds: [],
    provenance: {
      provenanceId: "prov-1",
      provenanceType: "public_live",
      sourceName: "web",
      sourceLocator: "https://example.com",
      retrievedAt: "2024-01-01T00:00:00Z",
      confidence: 0.9,
    },
  };
}

function makeClaim(id: string): Claim {
  return {
    claimId: id,
    text: "test claim",
    evidenceIds: ["ev-1"],
    status: "unresolved",
    workstream: "commercial",
  };
}

function makeIssue(id: string): OpenIssue {
  return {
    issueId: id,
    title: "Test Issue",
    description: "A test issue",
    severity: "medium",
    workstream: "financial",
    evidenceIds: [],
    status: "open",
    nextAction: "investigate",
  };
}

function makeMemoSection(id: string): MemoSection {
  return {
    sectionId: id,
    sectionName: "Overview",
    markdown: "# Overview",
    evidenceIds: [],
    confidence: 0.8,
    updatedBy: "agent-1",
  };
}

function makeToolHistory(): ToolHistoryEntry {
  return {
    toolName: "web_research.search",
    input: { query: "test" },
    output: { results: [] },
    timestamp: "2024-01-01T00:00:00Z",
    duration: 150,
    success: true,
  };
}

describe("WorkspaceStore", () => {
  it("can create with seed data", () => {
    const seed = makeSeed({ codeName: "Project Beta" });
    const store = new WorkspaceStore(seed);
    const ws = store.getWorkspace();

    expect(ws.dealId).toBe("deal-1");
    expect(ws.codeName).toBe("Project Beta");
    expect(ws.evidence).toHaveLength(0);
  });

  it("does not mutate the original seed", () => {
    const seed = makeSeed();
    const store = new WorkspaceStore(seed);
    store.upsertEvidence(makeEvidence("ev-1"));

    expect(seed.evidence).toHaveLength(0);
  });

  describe("upsertEvidence", () => {
    it("adds new evidence", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertEvidence(makeEvidence("ev-1"));

      const ws = store.getWorkspace();
      expect(ws.evidence).toHaveLength(1);
      expect(ws.evidence[0].evidenceId).toBe("ev-1");
    });

    it("updates existing evidence by ID", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertEvidence(makeEvidence("ev-1"));
      store.upsertEvidence({ ...makeEvidence("ev-1"), confidence: 0.5 });

      const ws = store.getWorkspace();
      expect(ws.evidence).toHaveLength(1);
      expect(ws.evidence[0].confidence).toBe(0.5);
    });
  });

  describe("upsertIssue", () => {
    it("adds new issues", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertIssue(makeIssue("iss-1"));
      store.upsertIssue(makeIssue("iss-2"));

      expect(store.getWorkspace().issues).toHaveLength(2);
    });

    it("updates existing issue by ID", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertIssue(makeIssue("iss-1"));
      store.upsertIssue({ ...makeIssue("iss-1"), status: "resolved" });

      const ws = store.getWorkspace();
      expect(ws.issues).toHaveLength(1);
      expect(ws.issues[0].status).toBe("resolved");
    });
  });

  describe("upsertMemoSection", () => {
    it("adds new memo sections", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertMemoSection(makeMemoSection("sec-1"));

      expect(store.getWorkspace().memoSections).toHaveLength(1);
    });

    it("updates existing memo section by ID", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertMemoSection(makeMemoSection("sec-1"));
      store.upsertMemoSection({
        ...makeMemoSection("sec-1"),
        markdown: "# Updated",
      });

      const ws = store.getWorkspace();
      expect(ws.memoSections).toHaveLength(1);
      expect(ws.memoSections[0].markdown).toBe("# Updated");
    });
  });

  describe("upsertClaim", () => {
    it("adds new claims", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertClaim(makeClaim("cl-1"));

      expect(store.getWorkspace().claims).toHaveLength(1);
      expect(store.getWorkspace().claims[0].claimId).toBe("cl-1");
    });

    it("updates existing claim by ID", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertClaim(makeClaim("cl-1"));
      store.upsertClaim({ ...makeClaim("cl-1"), status: "supported" });

      const ws = store.getWorkspace();
      expect(ws.claims).toHaveLength(1);
      expect(ws.claims[0].status).toBe("supported");
    });
  });

  describe("addContradiction", () => {
    it("appends contradictions", () => {
      const store = new WorkspaceStore(makeSeed());
      const contradiction: Contradiction = {
        contradictionId: "con-1",
        claimA: "cl-1",
        claimB: "cl-2",
        evidenceIds: ["ev-1"],
      };
      store.addContradiction(contradiction);

      const ws = store.getWorkspace();
      expect(ws.contradictions).toHaveLength(1);
      expect(ws.contradictions[0].contradictionId).toBe("con-1");
    });
  });

  describe("addToolHistory", () => {
    it("tracks tool calls", () => {
      const store = new WorkspaceStore(makeSeed());
      store.addToolHistory(makeToolHistory());
      store.addToolHistory({ ...makeToolHistory(), toolName: "vdr.search" });

      expect(store.getWorkspace().toolHistory).toHaveLength(2);
    });
  });

  describe("getWorkspace", () => {
    it("returns the full workspace state", () => {
      const store = new WorkspaceStore(makeSeed());
      store.upsertEvidence(makeEvidence("ev-1"));
      store.upsertClaim(makeClaim("cl-1"));
      store.upsertIssue(makeIssue("iss-1"));
      store.upsertMemoSection(makeMemoSection("sec-1"));
      store.addToolHistory(makeToolHistory());

      const ws = store.getWorkspace();
      expect(ws.dealId).toBe("deal-1");
      expect(ws.evidence).toHaveLength(1);
      expect(ws.claims).toHaveLength(1);
      expect(ws.issues).toHaveLength(1);
      expect(ws.memoSections).toHaveLength(1);
      expect(ws.toolHistory).toHaveLength(1);
    });
  });

  describe("onChange", () => {
    it("fires mutation events on upsert", () => {
      const store = new WorkspaceStore(makeSeed());
      const listener = vi.fn();
      store.onChange(listener);

      store.upsertEvidence(makeEvidence("ev-1"));

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "evidence.upserted" })
      );
    });
  });
});
