"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RunEvent } from "@/lib/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

export function useEventStream(runId: string | null) {
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const connect = useCallback(() => {
    if (!runId) return;

    try {
      const es = new EventSource(`${API_BASE}/api/run/${runId}/events`);
      esRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      es.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          // Map HarnessEvent shape to RunEvent shape
          const event: RunEvent = {
            id: raw.eventId ?? raw.id ?? String(Date.now()),
            timestamp: raw.timestamp,
            type: raw.eventType ?? raw.type ?? "unknown",
            actor: raw.actorName ?? raw.actor ?? "system",
            summary: raw.summary ?? "",
            data: raw.payload ?? raw.data,
          };
          setEvents((prev) => [...prev, event]);
        } catch {
          // ignore parse errors for non-JSON messages
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        setError("Connection lost. Reconnecting...");
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }, [runId]);

  // Reset events and reconnect when runId changes
  useEffect(() => {
    setEvents([]);
    setError(null);
    setIsConnected(false);
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, isConnected, error, clearEvents };
}
