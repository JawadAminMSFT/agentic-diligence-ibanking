import { LocalArtifactStore } from "./local-store.js";
import { BlobArtifactStore } from "./blob-store.js";
import type { ArtifactStore } from "./types.js";

export type { ArtifactStore, ArtifactMetadata } from "./types.js";

export function createArtifactStore(config?: {
  type?: string;
  path?: string;
  connectionString?: string;
  container?: string;
}): ArtifactStore {
  const storeType = config?.type ?? process.env.ARTIFACT_STORE_TYPE ?? "local";

  if (storeType === "local") {
    return new LocalArtifactStore(config?.path ?? process.env.ARTIFACT_STORE_PATH);
  }

  if (storeType === "azure-blob") {
    const connStr =
      config?.connectionString ?? process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connStr) {
      throw new Error(
        "AZURE_STORAGE_CONNECTION_STRING is required for azure-blob artifact store",
      );
    }
    return new BlobArtifactStore(
      connStr,
      config?.container ?? process.env.AZURE_STORAGE_CONTAINER,
    );
  }

  throw new Error(`Unknown artifact store type: ${storeType}`);
}
