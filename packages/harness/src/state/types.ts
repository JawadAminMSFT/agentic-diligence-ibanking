import { z } from "zod";

// --- Provenance ---

export const ProvenanceTypeSchema = z.enum([
  "public_live",
  "synthetic_private",
  "derived",
  "canonical_hidden",
]);
export type ProvenanceType = z.infer<typeof ProvenanceTypeSchema>;

export const ProvenanceSchema = z.object({
  provenanceId: z.string(),
  provenanceType: ProvenanceTypeSchema,
  sourceName: z.string(),
  sourceLocator: z.string(),
  retrievedAt: z.string().datetime(),
  confidence: z.number().min(0).max(1),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

// --- Evidence ---

export const EvidenceItemSchema = z.object({
  evidenceId: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  locationRef: z.string(),
  extractedText: z.string(),
  confidence: z.number().min(0).max(1),
  linkedClaimIds: z.array(z.string()),
  provenance: ProvenanceSchema,
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// --- Claim ---

export const ClaimStatusSchema = z.enum([
  "supported",
  "contradicted",
  "unresolved",
]);
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

export const ClaimSchema = z.object({
  claimId: z.string(),
  text: z.string(),
  evidenceIds: z.array(z.string()),
  status: ClaimStatusSchema,
  workstream: z.string(),
});
export type Claim = z.infer<typeof ClaimSchema>;

// --- Contradiction ---

export const ContradictionSchema = z.object({
  contradictionId: z.string(),
  claimA: z.string(),
  claimB: z.string(),
  evidenceIds: z.array(z.string()),
  resolution: z.string().optional(),
  resolvedBy: z.string().optional(),
});
export type Contradiction = z.infer<typeof ContradictionSchema>;

// --- Open Issue ---

export const SeveritySchema = z.enum(["low", "medium", "high"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const WorkstreamSchema = z.enum([
  "commercial",
  "financial",
  "legal",
  "synthesis",
]);
export type Workstream = z.infer<typeof WorkstreamSchema>;

export const IssueStatusSchema = z.enum(["open", "resolved", "escalated"]);
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

export const OpenIssueSchema = z.object({
  issueId: z.string(),
  title: z.string(),
  description: z.string(),
  severity: SeveritySchema,
  workstream: WorkstreamSchema,
  evidenceIds: z.array(z.string()),
  status: IssueStatusSchema,
  nextAction: z.string(),
});
export type OpenIssue = z.infer<typeof OpenIssueSchema>;

// --- Memo Section ---

export const MemoSectionSchema = z.object({
  sectionId: z.string(),
  sectionName: z.string(),
  markdown: z.string(),
  evidenceIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  updatedBy: z.string(),
});
export type MemoSection = z.infer<typeof MemoSectionSchema>;

// --- Tool History Entry ---

export const ToolHistoryEntrySchema = z.object({
  toolName: z.string(),
  input: z.unknown(),
  output: z.unknown(),
  timestamp: z.string().datetime(),
  duration: z.number(),
  success: z.boolean(),
});
export type ToolHistoryEntry = z.infer<typeof ToolHistoryEntrySchema>;

// --- Deal Workspace ---

export const DealWorkspaceSchema = z.object({
  dealId: z.string(),
  codeName: z.string(),
  status: z.string(),
  currentStage: z.string(),
  dataPackageVersion: z.string(),
  claims: z.array(ClaimSchema),
  issues: z.array(OpenIssueSchema),
  memoSections: z.array(MemoSectionSchema),
  evidence: z.array(EvidenceItemSchema),
  contradictions: z.array(ContradictionSchema).default([]),
  toolHistory: z.array(ToolHistoryEntrySchema),
});
export type DealWorkspace = z.infer<typeof DealWorkspaceSchema>;

// --- Run Plan ---

export const RunPlanSchema = z.object({
  objective: z.string(),
  workstreams: z.array(WorkstreamSchema),
  steps: z.array(
    z.object({
      stepId: z.string(),
      description: z.string(),
      agent: z.string(),
      dependsOn: z.array(z.string()).default([]),
    })
  ),
  knownUnknowns: z.array(z.string()),
  approvalCheckpoints: z.array(z.string()),
});
export type RunPlan = z.infer<typeof RunPlanSchema>;
