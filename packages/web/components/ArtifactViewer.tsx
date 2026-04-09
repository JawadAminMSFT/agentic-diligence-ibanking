"use client";

import { useState, useEffect } from "react";
import { fetchArtifacts, getArtifactUrl, type Artifact } from "@/lib/api-client";

const ARTIFACT_META: Record<string, { label: string; description?: string; colorClass: string; icon: React.ReactNode }> = {
  memo: {
    label: "Investment Memo (PDF)",
    colorClass: "text-blue-600 bg-blue-50 border-blue-200",
    icon: (
      <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  deck: {
    label: "Summary Deck (PPTX)",
    colorClass: "text-violet-600 bg-violet-50 border-violet-200",
    icon: (
      <svg className="w-6 h-6 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  dashboard: {
    label: "Data Dashboard",
    description: "Interactive analytics dashboard",
    colorClass: "text-amber-600 bg-amber-50 border-amber-200",
    icon: (
      <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
};

function getArtifactMeta(type: string) {
  return ARTIFACT_META[type] ?? {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    colorClass: "text-slate-600 bg-slate-50 border-slate-200",
    icon: (
      <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  runId: string;
  dealName: string;
  onClose: () => void;
  onOpenDashboard?: (runId: string) => void;
}

export default function ArtifactViewer({ runId, dealName, onClose, onOpenDashboard }: Props) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    fetchArtifacts(runId)
      .then(setArtifacts)
      .finally(() => setLoading(false));
  }, [runId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-5xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            {previewing && (
              <button
                onClick={() => setPreviewing(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                title="Back to list"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12L6 8l4-4" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">{dealName}</h2>
              <p className="text-xs text-slate-400">
                {previewing ? `Previewing ${previewing}` : "Artifacts"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="w-6 h-6 text-slate-300 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 019.5 7" strokeLinecap="round" />
              </svg>
            </div>
          ) : previewing ? (
            previewing.endsWith(".pptx") ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <svg className="w-12 h-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
                <p className="text-sm text-slate-500">Download to view in PowerPoint</p>
                <a
                  href={getArtifactUrl(runId, previewing)}
                  download={previewing}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2 rounded-md inline-flex items-center gap-2 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v9M4 8l4 4 4-4M2 13h12" />
                  </svg>
                  Download PPTX
                </a>
              </div>
            ) : (
              <iframe
                src={getArtifactUrl(runId, previewing)}
                className="w-full h-full border-0 rounded-b-xl"
                title={`Preview ${previewing}`}
              />
            )
          ) : artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <svg className="w-10 h-10 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <p className="text-sm text-slate-400">No artifacts generated yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {artifacts.map((artifact) => {
                const meta = getArtifactMeta(artifact.type);
                return (
                  <div
                    key={artifact.filename}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 p-2 rounded-lg border ${meta.colorClass}`}>
                        {meta.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">{meta.label}</h3>
                        {meta.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          {artifact.filename} &middot; {formatSize(artifact.size)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Generated {relativeTime(artifact.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      {artifact.filename.endsWith(".pptx") ? (
                        <a
                          href={getArtifactUrl(runId, artifact.filename)}
                          download={artifact.filename}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium transition-colors"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 1v7M3 6l3 3 3-3M1 10h10" />
                          </svg>
                          Download
                        </a>
                      ) : artifact.type === "dashboard" ? (
                        <button
                          onClick={() => {
                            if (onOpenDashboard) {
                              onClose();
                              onOpenDashboard(runId);
                            } else {
                              window.open(`/dashboard/${runId}`, '_blank');
                            }
                          }}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium transition-colors"
                        >
                          Open Dashboard
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 3L3 9" />
                            <path d="M5 3h4v4" />
                          </svg>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setPreviewing(artifact.filename)}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                          >
                            Preview
                          </button>
                          <a
                            href={getArtifactUrl(runId, artifact.filename)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                          >
                            Open in new tab
                          </a>
                        </>
                      )}
                      {artifact.filename.endsWith(".pdf") && (
                        <a
                          href={getArtifactUrl(runId, artifact.filename)}
                          download={artifact.filename}
                          className="border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium transition-colors"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 1v7M3 6l3 3 3-3M1 10h10" />
                          </svg>
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Compact artifact card list for use inside the IntelPanel Artifacts tab. */
export function ArtifactCards({ runId, onOpenDashboard }: { runId: string; onOpenDashboard?: (runId: string) => void }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtifacts(runId)
      .then(setArtifacts)
      .finally(() => setLoading(false));
  }, [runId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="w-5 h-5 text-slate-300 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 019.5 7" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <svg className="w-8 h-8 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        <p className="text-xs text-slate-400">No artifacts generated yet</p>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      {artifacts.map((artifact) => {
        const meta = getArtifactMeta(artifact.type);
        return (
          <div
            key={artifact.filename}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`shrink-0 p-2 rounded-lg border ${meta.colorClass}`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">{meta.label}</h3>
                {meta.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">
                  {artifact.filename} &middot; {formatSize(artifact.size)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated {relativeTime(artifact.createdAt)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {artifact.filename.endsWith(".pptx") ? (
                    <a
                      href={getArtifactUrl(runId, artifact.filename)}
                      download={artifact.filename}
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 1v7M3 6l3 3 3-3M1 10h10" />
                      </svg>
                      Download PPTX
                    </a>
                  ) : artifact.type === "dashboard" ? (
                    <button
                      onClick={() => {
                        if (onOpenDashboard) {
                          onOpenDashboard(runId);
                        } else {
                          window.open(`/dashboard/${runId}`, '_blank');
                        }
                      }}
                      className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Open Dashboard
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3L3 9" />
                        <path d="M5 3h4v4" />
                      </svg>
                    </button>
                  ) : (
                    <a
                      href={getArtifactUrl(runId, artifact.filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Open in new tab
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3L3 9" />
                        <path d="M5 3h4v4" />
                      </svg>
                    </a>
                  )}
                  {artifact.filename.endsWith(".pdf") && (
                    <a
                      href={getArtifactUrl(runId, artifact.filename)}
                      download={artifact.filename}
                      className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 1v7M3 6l3 3 3-3M1 10h10" />
                      </svg>
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
