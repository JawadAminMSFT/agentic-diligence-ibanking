"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { startRun, startReplay, listSessions, fetchDeals, approveAction, type Session, type RunEvent, type DealInfo } from "@/lib/api-client";
import DocumentBrowser from "@/components/DocumentBrowser";
import { useEventStream } from "@/hooks/useEventStream";
import { useRunState } from "@/hooks/useRunState";
import Sidebar from "@/components/Sidebar";
import RunTimeline from "@/components/RunTimeline";
import IntelPanel from "@/components/IntelPanel";
import ArtifactViewer from "@/components/ArtifactViewer";
import DashboardModal from "@/components/DashboardModal";
import ModelComparisonModal from "@/components/ModelComparisonModal";

export default function App() {
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [deals, setDeals] = useState<DealInfo[]>([]);
  const [intelOpen, setIntelOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardRunId, setDashboardRunId] = useState<string | null>(null);
  const [comparisonRunId, setComparisonRunId] = useState<string | null>(null);

  // Sync activeRunId with URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setActiveRunId(hash);

    const onHashChange = () => {
      const h = window.location.hash.slice(1);
      setActiveRunId(h || null);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    listSessions().then(setSessions).catch(() => {});
    fetchDeals().then(setDeals).catch(() => {
      setDeals([
        { dealId: "atlas", codeName: "Project Atlas", sector: "Supply Chain SaaS", description: "Supply-chain orchestration platform", targetARR: "$62.4M", targetGrowth: "63% YoY", keyMetric: "140% NRR" },
        { dealId: "titan", codeName: "Project Titan", sector: "Cybersecurity", description: "Cloud-native endpoint security platform", targetARR: "$45M", targetGrowth: "48% YoY", keyMetric: "Enterprise 90%+ mix" },
        { dealId: "meridian", codeName: "Project Meridian", sector: "Healthcare Analytics", description: "Clinical analytics and population health platform", targetARR: "$28M", targetGrowth: "35% YoY", keyMetric: "95% GRR" },
      ]);
    });
  }, []);

  const handleStartRun = useCallback(async (prompt: string, dealId?: string) => {
    setError(null);
    try {
      const { runId } = await startRun(prompt, dealId);
      setActiveRunId(runId);
      window.location.hash = runId;
      setSessions((prev) => [
        { runId, dealName: prompt.slice(0, 60), status: "running", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start run");
    }
  }, []);

  const handleReplay = useCallback(async () => {
    setError(null);
    try {
      const { runId } = await startReplay();
      setActiveRunId(runId);
      window.location.hash = runId;
      setSessions((prev) => [
        { runId, dealName: "Demo Replay", status: "running", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start replay");
    }
  }, []);

  const handleSelectSession = useCallback((runId: string) => {
    setActiveRunId(runId);
    window.location.hash = runId;
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setActiveRunId(null);
    window.location.hash = "";
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar
        sessions={sessions}
        activeRunId={activeRunId}
        onSelectSession={handleSelectSession}
        onStartRun={handleStartRun}
        onReplay={handleReplay}
        error={error}
      />
      <MainContent
        activeRunId={activeRunId}
        intelOpen={intelOpen}
        onToggleIntel={() => setIntelOpen((v) => !v)}
        sessions={sessions}
        deals={deals}
        onStartRun={handleStartRun}
        onReplay={handleReplay}
        onSelectSession={handleSelectSession}
        onBack={handleBackToDashboard}
        onOpenDashboard={setDashboardRunId}
        onOpenComparison={setComparisonRunId}
        error={error}
      />
      {dashboardRunId && (
        <DashboardModal runId={dashboardRunId} onClose={() => setDashboardRunId(null)} />
      )}
      {comparisonRunId && (
        <ModelComparisonModal runId={comparisonRunId} onClose={() => setComparisonRunId(null)} />
      )}
    </div>
  );
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

function StatusBadge({ status }: { status: Session["status"] }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Running
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      Completed
    </span>
  );
}

const SECTOR_COLORS: Record<string, string> = {
  "Supply Chain SaaS": "bg-blue-50 text-blue-700",
  "Cybersecurity": "bg-red-50 text-red-700",
  "Healthcare Analytics": "bg-emerald-50 text-emerald-700",
};

function LandingPage({
  sessions,
  deals,
  onStartRun,
  onReplay,
  onSelectSession,
  onOpenDashboard,
  onOpenComparison,
  error,
}: {
  sessions: Session[];
  deals: DealInfo[];
  onStartRun: (prompt: string, dealId?: string) => void;
  onReplay: () => void;
  onSelectSession: (runId: string) => void;
  onOpenDashboard: (runId: string) => void;
  onOpenComparison: (runId: string) => void;
  error: string | null;
}) {
  const [prompt, setPrompt] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [viewingArtifacts, setViewingArtifacts] = useState<string | null>(null);
  const [viewingDocuments, setViewingDocuments] = useState<{dealId: string, dealName: string} | null>(null);

  async function handleSubmit() {
    if (!prompt.trim()) return;
    setIsStarting(true);
    await onStartRun(prompt.trim());
    setPrompt("");
    setIsStarting(false);
  }

  async function handleDealStart(deal: DealInfo) {
    const autoPrompt = `Run first-pass due diligence on ${deal.codeName}. Search public sources, review VDR, analyze financials, create issues for material findings, and write a full IC-quality investment memo.`;
    setIsStarting(true);
    await onStartRun(autoPrompt, deal.dealId);
    setIsStarting(false);
  }

  const activeDealCount = deals.length;
  const sessionCount = sessions.length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Summary Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Active Deals</span>
            <span className="text-lg font-semibold text-slate-900">{activeDealCount}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Sessions Run</span>
            <span className="text-lg font-semibold text-slate-900">{sessionCount}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Issues Found</span>
            <span className="text-lg font-semibold text-slate-400">&mdash;</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Avg Completion</span>
            <span className="text-lg font-semibold text-slate-400">&mdash;</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">AI Status</span>
            <span className="text-lg font-semibold text-slate-900 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Ready
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        {/* Deal Pipeline Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Deal Pipeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeDealCount} active targets in review</p>
            </div>
          </div>
          {deals.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Code Name</th>
                  <th className="text-left px-5 py-3 font-medium">Sector</th>
                  <th className="text-left px-5 py-3 font-medium">ARR</th>
                  <th className="text-left px-5 py-3 font-medium">Growth</th>
                  <th className="text-left px-5 py-3 font-medium">Key Metric</th>
                  <th className="text-left px-5 py-3 font-medium">Stage</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((deal) => {
                  const badgeColor = SECTOR_COLORS[deal.sector] ?? "bg-slate-100 text-slate-600";
                  return (
                    <tr key={deal.dealId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">{deal.codeName}</span>
                        <span className="block text-xs text-slate-400 mt-0.5">{deal.description}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>
                          {deal.sector}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900 whitespace-nowrap">{deal.targetARR}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900 whitespace-nowrap">{deal.targetGrowth}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{deal.keyMetric}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 whitespace-nowrap">
                          Initial Review
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingDocuments({ dealId: deal.dealId, dealName: deal.codeName })}
                          className="border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          Documents
                        </button>
                        <button
                          onClick={() => handleDealStart(deal)}
                          disabled={isStarting}
                          className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          Run Diligence
                        </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No deals available.
            </div>
          )}
        </div>

        {/* AI Command Bar */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 15h6" strokeLinecap="round" />
            </svg>
            <input
              className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
              placeholder="Run custom diligence analysis..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={isStarting || !prompt.trim()}
              className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0"
            >
              {isStarting ? "Running..." : "Execute"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 ml-8">or press Enter to execute</p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-center">
            {error}
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            {sessions.length > 0 && (
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {sessions.length}
              </span>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-400">No activity yet. Run diligence on a deal to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <button
                  key={session.runId}
                  onClick={() => onSelectSession(session.runId)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors text-left"
                >
                  {/* Status icon */}
                  {session.status === "running" ? (
                    <svg className="w-4 h-4 text-green-500 shrink-0 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 1a7 7 0 105.3 2.3" strokeLinecap="round" />
                    </svg>
                  ) : session.status === "failed" ? (
                    <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8.5l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span className="text-sm font-medium text-slate-900 truncate flex-1 min-w-0">
                    {session.dealName || session.runId.slice(0, 12)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {session.runId.slice(0, 8)}
                  </span>
                  {session.status === "completed" && (
                    <>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDashboard(session.runId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            onOpenDashboard(session.runId);
                          }
                        }}
                        className="shrink-0 border border-amber-200 hover:border-amber-300 text-amber-600 hover:text-amber-700 text-xs px-2 py-1 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        View Dashboard
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingArtifacts(session.runId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            setViewingArtifacts(session.runId);
                          }
                        }}
                        className="shrink-0 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs px-2 py-1 rounded-md font-medium transition-colors"
                      >
                        View Artifacts
                      </span>
                    </>
                  )}
                  <span className="shrink-0">
                    <StatusBadge status={session.status} />
                  </span>
                  <span className="text-xs text-slate-400 shrink-0 w-16 text-right">
                    {relativeTime(session.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Replay link */}
        <div className="text-center pb-4">
          <button onClick={onReplay} className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer transition-colors">
            Run demo replay
          </button>
        </div>
      </div>

      {/* Artifact viewer modal */}
      {viewingArtifacts && (
        <ArtifactViewer
          runId={viewingArtifacts}
          dealName={sessions.find((s) => s.runId === viewingArtifacts)?.dealName ?? viewingArtifacts}
          onClose={() => setViewingArtifacts(null)}
          onOpenDashboard={onOpenDashboard}
          onOpenComparison={onOpenComparison}
        />
      )}

      {/* Document browser modal */}
      {viewingDocuments && (
        <DocumentBrowser
          dealId={viewingDocuments.dealId}
          dealName={viewingDocuments.dealName}
          onClose={() => setViewingDocuments(null)}
        />
      )}
    </div>
  );
}

function MainContent({
  activeRunId,
  intelOpen,
  onToggleIntel,
  sessions,
  deals,
  onStartRun,
  onReplay,
  onSelectSession,
  onBack,
  onOpenDashboard,
  onOpenComparison,
  error,
}: {
  activeRunId: string | null;
  intelOpen: boolean;
  onToggleIntel: () => void;
  sessions: Session[];
  deals: DealInfo[];
  onStartRun: (prompt: string, dealId?: string) => void;
  onReplay: () => void;
  onSelectSession: (runId: string) => void;
  onBack: () => void;
  onOpenDashboard: (runId: string) => void;
  onOpenComparison: (runId: string) => void;
  error: string | null;
}) {
  if (!activeRunId) {
    return (
      <LandingPage
        sessions={sessions}
        deals={deals}
        onStartRun={onStartRun}
        onReplay={onReplay}
        onSelectSession={onSelectSession}
        onOpenDashboard={onOpenDashboard}
        onOpenComparison={onOpenComparison}
        error={error}
      />
    );
  }

  return <ActiveRunView key={activeRunId} runId={activeRunId} intelOpen={intelOpen} onToggleIntel={onToggleIntel} onBack={onBack} onOpenDashboard={onOpenDashboard} onOpenComparison={onOpenComparison} />;
}

function ActiveRunView({
  runId,
  intelOpen,
  onToggleIntel,
  onBack,
  onOpenDashboard,
  onOpenComparison,
}: {
  runId: string;
  intelOpen: boolean;
  onToggleIntel: () => void;
  onBack: () => void;
  onOpenDashboard: (runId: string) => void;
  onOpenComparison: (runId: string) => void;
}) {
  const { run, memo, issues, evidence, events, isConnected, isLoading } = useRunState(runId);
  const [resolvedApprovals, setResolvedApprovals] = useState<Set<string>>(new Set());

  const pendingApproval = useMemo(() => {
    const requested = events.filter((e) => e.type === "approval.requested");
    const resolved = events
      .filter((e) => e.type === "approval.granted" || e.type === "approval.denied")
      .map((e) => e.data?.toolName as string);
    for (let i = requested.length - 1; i >= 0; i--) {
      const req = requested[i];
      const toolName = (req.data?.toolName as string) ?? req.summary;
      if (!resolved.includes(toolName) && !resolvedApprovals.has(req.id)) {
        return {
          actionId: req.id,
          description: req.summary,
          agent: req.actor,
          toolName: (req.data?.toolName as string) ?? "unknown",
          args: (req.data?.input as Record<string, unknown>) ?? {},
        };
      }
    }
    return null;
  }, [events, resolvedApprovals]);

  const handleApprove = useCallback(async (actionId: string, approved: boolean) => {
    try {
      await approveAction(runId, actionId, approved);
      setResolvedApprovals((prev) => new Set(prev).add(actionId));
    } catch (err) {
      console.error("Approval failed:", err);
    }
  }, [runId]);

  const toolCallCount = events.filter((e) => e.type === "tool.invoked" || e.type === "tool.completed").length;

  return (
    <>
      <div className="flex flex-col h-full w-[400px] shrink-0">
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <RunTimeline
            run={run}
            events={events}
            isConnected={isConnected}
            isLoading={isLoading}
            pendingApproval={pendingApproval}
            onApprove={handleApprove}
            toolCallCount={toolCallCount}
          />
        </div>
      </div>
      {intelOpen && (
        <IntelPanel
          runId={runId}
          events={events}
          memo={memo}
          issues={issues}
          evidence={evidence}
          onClose={onToggleIntel}
          toolCallCount={toolCallCount}
          dealName={run.dealName}
          onOpenDashboard={onOpenDashboard}
          onOpenComparison={onOpenComparison}
        />
      )}
      {!intelOpen && (
        <button
          onClick={onToggleIntel}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
          title="Open Intelligence panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 2H14V6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2L8.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}
