import { describe, it, expect, vi } from "vitest";
import { createApprovalGateHook } from "../src/hooks/approval-gate.js";
import { createProvenanceTaggerHook } from "../src/hooks/provenance-tagger.js";

const dummyInvocation = { sessionId: "sess-1" };

function makePreToolInput(toolName: string, toolArgs: unknown = {}) {
  return {
    timestamp: Date.now(),
    cwd: "/workspace",
    toolName,
    toolArgs,
  };
}

function makePostToolInput(toolName: string) {
  return {
    timestamp: Date.now(),
    cwd: "/workspace",
    toolName,
    toolArgs: {},
    toolResult: { content: [{ type: "text" as const, text: "result" }] },
  };
}

describe("Approval Gate Hook", () => {
  it("tier-0 tools return allow", () => {
    const hook = createApprovalGateHook();
    const result = hook(makePreToolInput("web_research.search"), dummyInvocation);

    expect(result.permissionDecision).toBe("allow");
  });

  it("tier-1 tools return allow with logging", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const hook = createApprovalGateHook();
    const result = hook(
      makePreToolInput("workflow.create_issue"),
      dummyInvocation
    );

    expect(result.permissionDecision).toBe("allow");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Tier 1"),
      expect.any(String)
    );
    logSpy.mockRestore();
  });

  it("tier-2 tools return deny", () => {
    const hook = createApprovalGateHook();
    const result = hook(
      makePreToolInput("workflow.draft_seller_question"),
      dummyInvocation
    );

    expect(result.permissionDecision).toBe("deny");
    expect(result.permissionDecisionReason).toContain("human approval");
  });

  it("tier-2 tools invoke the approval callback", () => {
    const callback = vi.fn();
    const hook = createApprovalGateHook(callback);
    hook(makePreToolInput("workflow.draft_seller_question"), dummyInvocation);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        toolName: "workflow.draft_seller_question",
        tier: 2,
      })
    );
  });

  it("unknown tools default to allow", () => {
    const hook = createApprovalGateHook();
    const result = hook(
      makePreToolInput("completely_unknown_tool"),
      dummyInvocation
    );

    expect(result.permissionDecision).toBe("allow");
  });
});

describe("Provenance Tagger Hook", () => {
  it("web-research tools get public_live provenance", () => {
    const hook = createProvenanceTaggerHook();
    const result = hook(makePostToolInput("web_research.search"), dummyInvocation);

    const ctx = JSON.parse(result.additionalContext!);
    expect(ctx.provenance.provenanceType).toBe("public_live");
    expect(ctx.provenance.sourceName).toBe("web-research");
  });

  it("vdr tools get synthetic_private provenance", () => {
    const hook = createProvenanceTaggerHook();
    const result = hook(
      makePostToolInput("vdr.read_document"),
      dummyInvocation
    );

    const ctx = JSON.parse(result.additionalContext!);
    expect(ctx.provenance.provenanceType).toBe("synthetic_private");
    expect(ctx.provenance.sourceName).toBe("vdr");
  });

  it("finance tools get synthetic_private provenance", () => {
    const hook = createProvenanceTaggerHook();
    const result = hook(
      makePostToolInput("finance.extract_kpis"),
      dummyInvocation
    );

    const ctx = JSON.parse(result.additionalContext!);
    expect(ctx.provenance.provenanceType).toBe("synthetic_private");
  });

  it("unknown tools get derived provenance", () => {
    const hook = createProvenanceTaggerHook();
    const result = hook(
      makePostToolInput("unknown_tool"),
      dummyInvocation
    );

    const ctx = JSON.parse(result.additionalContext!);
    expect(ctx.provenance.provenanceType).toBe("derived");
    expect(ctx.provenance.sourceName).toBe("unknown");
  });

  it("workflow tools get derived provenance", () => {
    const hook = createProvenanceTaggerHook();
    const result = hook(
      makePostToolInput("workflow.create_issue"),
      dummyInvocation
    );

    const ctx = JSON.parse(result.additionalContext!);
    expect(ctx.provenance.provenanceType).toBe("derived");
    expect(ctx.provenance.sourceName).toBe("workflow");
  });
});
