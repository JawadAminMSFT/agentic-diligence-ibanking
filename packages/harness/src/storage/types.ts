/**
 * Abstraction for artifact storage.
 * Supports local filesystem (dev) and Azure Blob Storage (production).
 *
 * To add other providers:
 * 1. Create src/storage/my-store.ts implementing ArtifactStore
 * 2. Add case to createArtifactStore() in index.ts
 * 3. Set ARTIFACT_STORE_TYPE=my-store in .env
 */

export interface ArtifactMetadata {
  filename: string;
  type: "memo" | "deck" | "dashboard" | "model" | "other";
  format: string;
  size: number;
  createdAt: string;
  url?: string;
}

export interface ArtifactStore {
  /** Write artifact content for a run */
  write(runId: string, filename: string, content: string): Promise<void>;

  /** Read artifact content */
  read(runId: string, filename: string): Promise<string | null>;

  /** List all artifacts for a run */
  list(runId: string): Promise<ArtifactMetadata[]>;

  /** Check if an artifact exists */
  exists(runId: string, filename: string): Promise<boolean>;

  /** Get a URL to access the artifact (for serving to browser) */
  getUrl(runId: string, filename: string): string;
}
