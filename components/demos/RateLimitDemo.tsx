"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DemoShell } from "@/components/demos/DemoShell";

type RateLimitDemoProps = {
  limit?: number;
  windowSecs?: number;
};

type Event = {
  id: number;
  ts: number;
  label: string;
  allowed: boolean;
};

let nextId = 0;

export function RateLimitDemo({ limit = 5, windowSecs = 10 }: RateLimitDemoProps) {
  const [tokens, setTokens] = useState(limit);
  const [events, setEvents] = useState<Event[]>([]);
  const tokensRef = useRef(limit);

  // Token refill: limit/windowSecs per second, ticked every 100ms
  // Also keeps tokensRef in sync so sendRequest reads the latest value.
  useEffect(() => {
    const refillRate = limit / windowSecs;
    const interval = setInterval(() => {
      setTokens((t) => {
        const next = Math.min(limit, t + refillRate * 0.1);
        tokensRef.current = next;
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [limit, windowSecs]);

  const sendRequest = useCallback(() => {
    // Read and mutate the ref directly so the decision and the event
    // are computed once — avoids StrictMode double-invoking the updater.
    const current = tokensRef.current;
    const allowed = current >= 1;
    const next = allowed ? current - 1 : current;
    tokensRef.current = next;
    setTokens(next);
    setEvents((prev) =>
      [
        {
          id: nextId++,
          ts: Date.now(),
          label: allowed ? "Allowed" : "Rate limited",
          allowed,
        },
        ...prev,
      ].slice(0, 20)
    );
  }, []);

  const burst = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(sendRequest, i * 50);
    }
  }, [sendRequest]);

  const reset = useCallback(() => {
    setTokens(limit);
    setEvents([]);
  }, [limit]);

  const allowed = events.filter((e) => e.allowed).length;
  const blocked = events.filter((e) => !e.allowed).length;
  const tokenPct = Math.max(0, Math.min(1, tokens / limit));

  return (
    <DemoShell title="Rate Limit Demo">
      <div className="demo-token-bar-wrap">
        <div className="demo-token-bar">
          <div
            className="demo-token-bar-fill"
            style={{ transform: `scaleX(${tokenPct})` }}
          />
        </div>
        <span className="demo-token-label">
          {Math.floor(tokens)}/{limit} tokens
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
          {allowed} allowed · {blocked} blocked
        </div>
      )}
    </DemoShell>
  );
}
