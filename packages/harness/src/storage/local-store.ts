import fs from "node:fs";
import path from "node:path";
import type { ArtifactStore, ArtifactMetadata } from "./types.js";

export class LocalArtifactStore implements ArtifactStore {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.resolve(process.cwd(), "artifacts");
  }

  private dirFor(runId: string): string {
    return path.join(this.baseDir, runId);
  }

  async write(runId: string, filename: string, content: string): Promise<void> {
    const dir = this.dirFor(runId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), content, "utf-8");
  }

  async read(runId: string, filename: string): Promise<string | null> {
    const filePath = path.join(this.dirFor(runId), filename);
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  async list(runId: string): Promise<ArtifactMetadata[]> {
    const dir = this.dirFor(runId);
    try {
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".html") || f.endsWith(".md") || f.endsWith(".pdf") || f.endsWith(".pptx") || f.endsWith(".json") || f.endsWith(".xlsx"))
        .map((filename) => {
          const filePath = path.join(dir, filename);
          const stats = fs.statSync(filePath);
          const type = filename.includes("memo")
            ? ("memo" as const)
            : filename.includes("deck")
              ? ("deck" as const)
              : filename.includes("dashboard")
                ? ("dashboard" as const)
                : filename.includes("model")
                  ? ("model" as const)
                  : ("other" as const);
          return {
            filename,
            type,
            format: path.extname(filename).slice(1),
            size: stats.size,
            createdAt: stats.mtime.toISOString(),
          };
        });
    } catch {
      return [];
    }
  }

  async exists(runId: string, filename: string): Promise<boolean> {
    return fs.existsSync(path.join(this.dirFor(runId), filename));
  }

  getUrl(runId: string, filename: string): string {
    return `/api/run/${runId}/artifacts/${filename}`;
  }
}
