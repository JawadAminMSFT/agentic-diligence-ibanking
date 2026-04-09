import type {
  DealWorkspace,
  EvidenceItem,
  Claim,
  OpenIssue,
  MemoSection,
  ToolHistoryEntry,
  Contradiction,
} from "./types.js";

export type MutationEvent =
  | { kind: "evidence.upserted"; item: EvidenceItem }
  | { kind: "claim.upserted"; item: Claim }
  | { kind: "issue.upserted"; item: OpenIssue }
  | { kind: "memo.upserted"; item: MemoSection }
  | { kind: "tool.recorded"; item: ToolHistoryEntry }
  | { kind: "contradiction.added"; item: Contradiction };

export type MutationCallback = (event: MutationEvent) => void;

export class WorkspaceStore {
  private workspace: DealWorkspace;
  private listeners: MutationCallback[] = [];

  constructor(seed: DealWorkspace) {
    this.workspace = structuredClone(seed);
  }

  onChange(cb: MutationCallback): void {
    this.listeners.push(cb);
  }

  private emit(event: MutationEvent): void {
    for (const cb of this.listeners) {
      cb(event);
    }
  }

  getWorkspace(): Readonly<DealWorkspace> {
    return this.workspace;
  }

  upsertEvidence(item: EvidenceItem): void {
    const idx = this.workspace.evidence.findIndex(
      (e) => e.evidenceId === item.evidenceId
    );
    if (idx >= 0) {
      this.workspace.evidence[idx] = item;
    } else {
      this.workspace.evidence.push(item);
    }
    this.emit({ kind: "evidence.upserted", item });
  }

  upsertClaim(item: Claim): void {
    const idx = this.workspace.claims.findIndex(
      (c) => c.claimId === item.claimId
    );
    if (idx >= 0) {
      this.workspace.claims[idx] = item;
    } else {
      this.workspace.claims.push(item);
    }
    this.emit({ kind: "claim.upserted", item });
  }

  upsertIssue(item: OpenIssue): void {
    const idx = this.workspace.issues.findIndex(
      (i) => i.issueId === item.issueId
    );
    if (idx >= 0) {
      this.workspace.issues[idx] = item;
    } else {
      this.workspace.issues.push(item);
    }
    this.emit({ kind: "issue.upserted", item });
  }

  upsertMemoSection(item: MemoSection): void {
    const idx = this.workspace.memoSections.findIndex(
      (m) => m.sectionId === item.sectionId
    );
    if (idx >= 0) {
      this.workspace.memoSections[idx] = item;
    } else {
      this.workspace.memoSections.push(item);
    }
    this.emit({ kind: "memo.upserted", item });
  }

  addToolHistory(item: ToolHistoryEntry): void {
    this.workspace.toolHistory.push(item);
    this.emit({ kind: "tool.recorded", item });
  }

  addContradiction(item: Contradiction): void {
    this.workspace.contradictions.push(item);
    this.emit({ kind: "contradiction.added", item });
  }
}
