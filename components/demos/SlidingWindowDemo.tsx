"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DemoShell } from "@/components/demos/DemoShell";

type SlidingWindowDemoProps = {
  limit?: number;
  windowSecs?: number;
};

type RLEvent = { id: number; ts: number; allowed: boolean; label: string };

let eventId = 0;

export function SlidingWindowDemo({
  limit = 5,
  windowSecs = 10,
}: SlidingWindowDemoProps) {
  const windowMs = windowSecs * 1000;
  // Timestamps of requests that counted toward the limit
  const timestamps = useRef<number[]>([]);

  const [activeCount, setActiveCount] = useState(0);
  const [events, setEvents] = useState<RLEvent[]>([]);

  // Prune expired timestamps to keep the bar live
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - windowMs;
      timestamps.current = timestamps.current.filter((ts) => ts > cutoff);
      setActiveCount(timestamps.current.length);
    }, 100);
    return () => clearInterval(interval);
  }, [windowMs]);

  const sendRequest = useCallback(() => {
    const t = Date.now();
    const cutoff = t - windowMs;
    timestamps.current = timestamps.current.filter((ts) => ts > cutoff);

    const allowed = timestamps.current.length < limit;
    if (allowed) timestamps.current.push(t);

    setActiveCount(timestamps.current.length);

    const event: RLEvent = {
      id: eventId++,
      ts: t,
      allowed,
      label: allowed ? "Allowed" : "Rate limited",
    };
    setEvents((prev) => [event, ...prev].slice(0, 20));
  }, [limit, windowMs]);

  const burst = useCallback(() => {
    for (let i = 0; i < 5; i++) setTimeout(sendRequest, i * 50);
  }, [sendRequest]);

  const reset = useCallback(() => {
    timestamps.current = [];
    setActiveCount(0);
    setEvents([]);
  }, []);

  const allowedCount = events.filter((e) => e.allowed).length;
  const blockedCount = events.filter((e) => !e.allowed).length;
  const fillPct = Math.min(1, activeCount / limit);

  return (
    <DemoShell title="Sliding Window">
      <div className="demo-token-bar-wrap">
        <div className="demo-token-bar">
          <div
            className="demo-token-bar-fill demo-token-bar-fill-used"
            style={{ transform: `scaleX(${fillPct})` }}
          />
        </div>
        <span className="demo-token-label">
          {activeCount}/{limit} in last {windowSecs}s
        </span>
      </div>

      <div className="demo-controls">
        <button className="demo-btn" onClick={sendRequest}>
          Send Request
        </button>
        <button className="demo-btn" onClick={burst}>
          Burst ×5
        </button>
        <button className="demo-btn" onClick={reset}>
          Reset
        </button>
      </div>

      <ul className="demo-timeline">
        {events.map((e) => (
          <li
            key={e.id}
            className={`demo-event ${e.allowed ? "demo-event-allowed" : "demo-event-blocked"}`}
          >
            <span className="demo-event-time">
              {new Date(e.ts).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              .{String(e.ts % 1000).padStart(3, "0")}
            </span>
            <span className="demo-event-icon">{e.allowed ? "✓" : "✗"}</span>
            <span className="demo-event-label">{e.label}</span>
          </li>
        ))}
      </ul>

      {events.length > 0 && (
        <div className="demo-stats">
          {allowedCount} allowed · {blockedCount} blocked
        </div>
      )}
    </DemoShell>
  );
}
