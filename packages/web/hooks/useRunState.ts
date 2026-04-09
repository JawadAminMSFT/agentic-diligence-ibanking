"use client";

import { useState, useEffect, useMemo } from "react";
import type { RunEvent, MemoSection, Issue, Evidence } from "@/lib/api-client";
import { useEventStream } from "./useEventStream";

interface RunInfo {
  runId: string;
  status: "running" | "paused" | "completed" | "failed";
  dealName: string;
  createdAt: string;
}

/** Safely extract parsed JSON from the nested result.content path (or fallback to data.content). */
function parseToolContent(data: Record<string, unknown> | undefined): Record<string, unknown> {
  try {
    const result = data?.result as Record<string, unknown> | undefined;
    const content = (result?.content as string) ?? (data?.content as string) ?? "";
    if (content.startsWith("{") || content.startsWith("[")) return JSON.parse(content);
  } catch { /* ignore malformed JSON */ }
  return {};
}

export function useRunState(runId: string) {
  const { events, isConnected, error: streamError } = useEventStream(runId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Stop loading once we get any events or after a short timeout
    if (events.length > 0) {
      setIsLoading(false);
    }
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [events.length]);

  // Derive all state incrementally from the event stream
  const run = useMemo<RunInfo>(() => {
    const startEvent = events.find((e) => e.type === "session.started" || e.type === "run.started");
    const dealName = (startEvent?.data?.codeName as string) ?? "Project Atlas";
    let status: RunInfo["status"] = "running";
    if (events.some((e) => e.type === "session.ended" || e.type === "run.completed")) status = "completed";
    else if (events.some((e) => e.type === "run.failed")) status = "failed";

    return {
      runId,
      status,
      dealName,
      createdAt: startEvent?.timestamp ?? new Date().toISOString(),
    };
  }, [events, runId]);

  // Extract issues incrementally from issue.created events
  const issues = useMemo<Issue[]>(() => {
    return events
      .filter((e) => e.type === "issue.created")
      .map((e) => {
        const parsed = parseToolContent(e.data);
        return {
          id: (parsed.issueId as string) ?? (e.data?.issueId as string) ?? e.id,
          title: (parsed.title as string) ?? (e.data?.title as string) ?? e.summary,
          severity: (parsed.severity as "low" | "medium" | "high") ?? "medium",
          workstream: (parsed.workstream as string) ?? (e.data?.workstream as string) ?? e.actor,
          description: (parsed.description as string) ?? (e.data?.description as string) ?? "",
          nextAction: (parsed.nextAction as string) ?? (e.data?.nextAction as string) ?? "",
        };
      });
  }, [events]);

  // Extract memo sections from memo.updated events
  const memo = useMemo<MemoSection[]>(() => {
    const sectionMap = new Map<string, MemoSection>();
    events
      .filter((e) => e.type === "memo.updated")
      .forEach((e) => {
        const parsed = parseToolContent(e.data);
        const section = (parsed.section as Record<string, unknown>) ?? {};
        const name = (section.name as string) ?? (e.data?.section as string) ?? (e.data?.sectionName as string) ?? "unknown";
        const markdown = (section.markdown as string) ?? (e.data?.markdown as string) ?? (e.data?.status as string) ?? e.summary;
        sectionMap.set(name, {
          title: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          content: markdown,
          confidence: (e.data?.confidence as number) ?? 0.8,
          evidenceIds: (section.evidenceIds as string[]) ?? (e.data?.evidenceIds as string[]) ?? [],
        });
      });
    return Array.from(sectionMap.values());
  }, [events]);

  // Extract evidence from tool.completed events for research / VDR / finance tools
  const evidence = useMemo<Evidence[]>(() => {
    const evidenceTools = [
      "web-research-search",
      "web-research-open_page",
      "vdr-search_documents",
      "vdr-open_document",
      "finance-load_kpis",
      "finance-compute_cohorts",
      "finance-revenue_bridge",
    ];

    return events
      .filter((e) => e.type === "tool.completed")
      .filter((e) => {
        const toolName = (e.data?.toolName as string) ?? e.actor ?? "";
        const norm = toolName.replace(/[-_.]/g, "");
        return evidenceTools.some(
          (t) => t === toolName || t.replace(/[-_.]/g, "") === norm,
        );
      })
      .map((e) => {
        const toolName = (e.data?.toolName as string) ?? e.actor ?? "unknown";

        // Determine provenance and confidence from tool prefix
        let provenance: Evidence["provenance"] = "derived";
        let confidence = 0.8;
        if (toolName.startsWith("web-research") || toolName.includes("webresearch")) {
          provenance = "public_live";
          confidence = 0.85;
        } else if (toolName.startsWith("vdr")) {
          provenance = "synthetic_private";
          confidence = 0.90;
        } else if (toolName.startsWith("finance")) {
          provenance = "synthetic_private";
          confidence = 0.92;
        }

        // Readable source label
        const source = toolName.startsWith("web-research")
          ? "Web Research"
          : toolName.startsWith("vdr")
            ? "VDR"
            : toolName.startsWith("finance")
              ? "Finance"
              : toolName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        // Extract text from result.content JSON
        let extractedText = "";
        try {
          const result = e.data?.result as Record<string, unknown> | undefined;
          const content = (result?.content as string) ?? "";
          if (content.startsWith("[")) {
            const arr = JSON.parse(content) as Record<string, unknown>[];
            const firstTitle =
              (arr[0]?.title as string) ?? (arr[0]?.name as string) ?? "";
            extractedText = `Found ${arr.length} results: ${firstTitle}…`;
          } else if (content.startsWith("{")) {
            const obj = JSON.parse(content) as Record<string, unknown>;
            const text =
              (obj.text as string) ??
              (obj.content as string) ??
              (obj.markdown as string) ??
              JSON.stringify(obj);
            extractedText = text.length > 200 ? text.slice(0, 200) + "…" : text;
          } else if (content) {
            extractedText = content.length > 200 ? content.slice(0, 200) + "…" : content;
          }
        } catch {
          extractedText = e.summary;
        }
        if (!extractedText) extractedText = e.summary;

        return {
          id: `ev-${e.id}`,
          source,
          extractedText,
          confidence,
          provenance,
        };
      });
  }, [events]);

  return { run, memo, issues, evidence, events, isConnected, isLoading, streamError };
}
