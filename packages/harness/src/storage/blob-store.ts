import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import type { ArtifactStore, ArtifactMetadata } from "./types.js";

export class BlobArtifactStore implements ArtifactStore {
  private container: ContainerClient;

  constructor(connectionString: string, containerName?: string) {
    const name = containerName ?? "diligence-artifacts";
    const blobService = BlobServiceClient.fromConnectionString(connectionString);
    this.container = blobService.getContainerClient(name);
    // Create container if it doesn't exist (fire-and-forget)
    this.container.createIfNotExists().catch(() => {});
  }

  private blobName(runId: string, filename: string): string {
    return `${runId}/${filename}`;
  }

  async write(runId: string, filename: string, content: string): Promise<void> {
    const blob = this.container.getBlockBlobClient(this.blobName(runId, filename));
    const buffer = Buffer.from(content, "utf-8");
    await blob.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: filename.endsWith(".html") ? "text/html" : "text/plain",
      },
    });
  }

  async read(runId: string, filename: string): Promise<string | null> {
    try {
      const blob = this.container.getBlockBlobClient(this.blobName(runId, filename));
      const response = await blob.download(0);
      const chunks: Buffer[] = [];
      if (response.readableStreamBody) {
        for await (const chunk of response.readableStreamBody) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
      }
      return Buffer.concat(chunks).toString("utf-8");
    } catch {
      return null;
    }
  }

  async list(runId: string): Promise<ArtifactMetadata[]> {
    const artifacts: ArtifactMetadata[] = [];
    try {
      for await (const blob of this.container.listBlobsFlat({ prefix: `${runId}/` })) {
        const filename = blob.name.split("/").pop() ?? blob.name;
        if (!filename.endsWith(".html") && !filename.endsWith(".md")) continue;
        const type = filename.includes("memo")
          ? ("memo" as const)
          : filename.includes("deck")
            ? ("deck" as const)
            : filename.includes("dashboard")
              ? ("dashboard" as const)
              : ("other" as const);
        artifacts.push({
          filename,
          type,
          format: filename.split(".").pop() ?? "html",
          size: blob.properties.contentLength ?? 0,
          createdAt: blob.properties.lastModified?.toISOString() ?? new Date().toISOString(),
          url: this.getUrl(runId, filename),
        });
      }
    } catch {
      /* container may not exist yet */
    }
    return artifacts;
  }

  async exists(runId: string, filename: string): Promise<boolean> {
    try {
      const blob = this.container.getBlockBlobClient(this.blobName(runId, filename));
      return await blob.exists();
    } catch {
      return false;
    }
  }

  getUrl(runId: string, filename: string): string {
    // Server-proxied URL — the server reads from blob and serves
    return `/api/run/${runId}/artifacts/${filename}`;
  }
}
