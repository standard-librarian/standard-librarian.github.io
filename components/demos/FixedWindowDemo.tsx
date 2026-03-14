"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DemoShell } from "@/components/demos/DemoShell";

type FixedWindowDemoProps = {
  limit?: number;
  windowSecs?: number;
  startOnFirstRequest?: boolean;
};

type RLEvent = { id: number; ts: number; allowed: boolean; label: string };

let eventId = 0;

function alignedStart(windowMs: number) {
  return Math.floor(Date.now() / windowMs) * windowMs;
}

export function FixedWindowDemo({
  limit = 5,
  windowSecs = 10,
  startOnFirstRequest = false,
}: FixedWindowDemoProps) {
  const windowMs = windowSecs * 1000;
  const windowStartRef = useRef<number | null>(
    startOnFirstRequest ? null : alignedStart(windowMs)
  );
  const countRef = useRef(0);

  const [display, setDisplay] = useState({
    windowStart: windowStartRef.current,
    count: 0,
    now: Date.now(),
  });
  const [events, setEvents] = useState<RLEvent[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now();

      if (!startOnFirstRequest) {
        const aligned = alignedStart(windowMs);
        if (aligned !== windowStartRef.current) {
          windowStartRef.current = aligned;
          countRef.current = 0;
        }
      } else {
        if (
          windowStartRef.current !== null &&
          t >= windowStartRef.current + windowMs
        ) {
          windowStartRef.current = null;
          countRef.current = 0;
        }
      }

      setDisplay({
        windowStart: windowStartRef.current,
        count: countRef.current,
        now: t,
      });
    }, 100);
    return () => clearInterval(interval);
  }, [windowMs, startOnFirstRequest]);

  const sendRequest = useCallback(() => {
    const t = Date.now();

    if (startOnFirstRequest && windowStartRef.current === null) {
      windowStartRef.current = t;
      countRef.current = 0;
    }

    const allowed = countRef.current < limit;
    if (allowed) countRef.current++;

    const event: RLEvent = {
      id: eventId++,
      ts: t,
      allowed,
      label: allowed ? "Allowed" : "Rate limited",
    };
    setEvents((prev) => [event, ...prev].slice(0, 20));
    setDisplay((d) => ({
      ...d,
      windowStart: windowStartRef.current,
      count: countRef.current,
    }));
  }, [limit, startOnFirstRequest]);

  const burst = useCallback(() => {
    for (let i = 0; i < 5; i++) setTimeout(sendRequest, i * 50);
  }, [sendRequest]);

  const reset = useCallback(() => {
    windowStartRef.current = startOnFirstRequest ? null : alignedStart(windowMs);
    countRef.current = 0;
    setEvents([]);
    setDisplay({
      windowStart: windowStartRef.current,
      count: 0,
      now: Date.now(),
    });
  }, [startOnFirstRequest, windowMs]);

  const { windowStart, count, now } = display;
  const timeLeft =
    windowStart !== null
      ? Math.max(0, (windowStart + windowMs - now) / 1000)
      : null;

  const allowedCount = events.filter((e) => e.allowed).length;
  const blockedCount = events.filter((e) => !e.allowed).length;
  const fillPct = Math.min(1, count / limit);

  const title = startOnFirstRequest
    ? "Fixed Window (user start)"
    : "Fixed Window";

  return (
    <DemoShell title={title}>
      <div className="demo-window-info">
        <span className="demo-window-count">
          {count}/{limit} requests this window
        </span>
        {timeLeft !== null ? (
          <span className="demo-window-reset">resets in {timeLeft.toFixed(1)}s</span>
        ) : (
          <span className="demo-window-reset demo-window-no-window">
            no active window
          </span>
        )}
      </div>

      <div className="demo-token-bar-wrap">
        <div className="demo-token-bar">
          <div
            className="demo-token-bar-fill demo-token-bar-fill-used"
            style={{ transform: `scaleX(${fillPct})` }}
          />
        </div>
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
