"use client";

import { useReducer, useEffect, useCallback, useState, useRef } from "react";
import type { ReactNode } from "react";
import type {
  ComponentDef,
  BlockDef,
  Op,
  Condition,
  LogEntry,
  MessageItem,
  ContextRequestItem,
  ScenarioDef,
  ScenarioStep,
} from "@/types/component";
import { MermaidDiagram } from "@/components/MermaidDiagram";

type State = Record<
  string,
  number | boolean | LogEntry[] | number[] | string | MessageItem[] | ContextRequestItem[] | unknown[]
>;

function resolveConditionOperand(
  val: string | number,
  state: State
): number {
  if (typeof val === "number") return val;
  const sv = state[val];
  if (Array.isArray(sv)) return sv.length;
  if (typeof sv === "number") return sv;
  if (typeof sv === "boolean") return sv ? 1 : 0;
  return 0;
}

function evaluateCondition(cond: Condition, state: State): boolean {
  const left = resolveConditionOperand(cond.left, state);
  const right = resolveConditionOperand(cond.right, state);
  switch (cond.op) {
    case "lt": return left < right;
    case "lte": return left <= right;
    case "gt": return left > right;
    case "gte": return left >= right;
    case "eq": return left === right;
  }
}

function applyOps(state: State, ops: Op[]): State {
  let s = { ...state };
  for (const op of ops) {
    switch (op.type) {
      case "set":
        s = { ...s, [op.target]: op.value as State[string] };
        break;
      case "increment": {
        const cur = s[op.target];
        s = { ...s, [op.target]: (typeof cur === "number" ? cur : 0) + (op.delta ?? 1) };
        break;
      }
      case "decrement": {
        const cur = s[op.target];
        s = { ...s, [op.target]: (typeof cur === "number" ? cur : 0) - (op.delta ?? 1) };
        break;
      }
      case "reset": {
        const cur = s[op.target];
        if (Array.isArray(cur)) s = { ...s, [op.target]: [] };
        else if (typeof cur === "boolean") s = { ...s, [op.target]: false };
        else if (typeof cur === "string") s = { ...s, [op.target]: "" };
        else s = { ...s, [op.target]: 0 };
        break;
      }
      case "clamp": {
        const cur = s[op.target];
        const n = typeof cur === "number" ? cur : 0;
        s = { ...s, [op.target]: Math.max(op.min, Math.min(op.max, n)) };
        break;
      }
      case "append-log": {
        const existing = (s[op.target] as LogEntry[]) ?? [];
        const message = op.fromState
          ? String(s[op.fromState] ?? "")
          : op.template;
        const entry: LogEntry = { time: Date.now(), kind: op.kind, message };
        s = { ...s, [op.target]: [entry, ...existing].slice(0, 50) };
        break;
      }
      case "append-timestamp": {
        const existing = (s[op.target] as number[]) ?? [];
        s = { ...s, [op.target]: [...existing, Date.now()] };
        break;
      }
      case "prune-timestamps": {
        const existing = (s[op.target] as number[]) ?? [];
        const cutoff = Date.now() - op.windowMs;
        s = { ...s, [op.target]: existing.filter((t) => t > cutoff) };
        break;
      }
      case "set-window-end": {
        const windowMs = op.windowMs;
        const start = Math.floor(Date.now() / windowMs) * windowMs;
        s = { ...s, [op.target]: start + windowMs };
        break;
      }
      case "conditional": {
        const branch = evaluateCondition(op.condition, s) ? op.then : (op.else ?? []);
        s = applyOps(s, branch);
        break;
      }
      case "push": {
        const existing = Array.isArray(s[op.target]) ? (s[op.target] as unknown[]) : [];
        s = { ...s, [op.target]: [...existing, op.value] };
        break;
      }
      case "pop": {
        const existing = Array.isArray(s[op.target]) ? (s[op.target] as unknown[]) : [];
        s = { ...s, [op.target]: existing.slice(0, -1) };
        break;
      }
      case "toggle": {
        s = { ...s, [op.target]: !s[op.target] };
        break;
      }
      case "mod": {
        const n = typeof s[op.target] === "number" ? (s[op.target] as number) : 0;
        s = { ...s, [op.target]: n % op.modulus };
        break;
      }
      case "append-message": {
        const existing = (s[op.target] as MessageItem[]) ?? [];
        const content = op.fromState ? String(s[op.fromState] ?? "") : (op.content ?? "");
        const entry: MessageItem = {
          id: Date.now(),
          role: op.role as MessageItem["role"],
          content,
          ...(op.toolName ? { toolName: op.toolName } : {}),
        };
        s = { ...s, [op.target]: [...existing, entry] };
        break;
      }
      case "clear-string": {
        s = { ...s, [op.target]: "" };
        break;
      }
      case "set-string": {
        s = { ...s, [op.target]: op.value };
        break;
      }
      case "push-state": {
        const existing = Array.isArray(s[op.target]) ? (s[op.target] as number[]) : [];
        const val = s[op.source];
        const num = typeof val === "number" ? val : 0;
        s = { ...s, [op.target]: [...existing, num] };
        break;
      }
      case "delay-then": {
        // no-op in reducer — handled by runAction
        break;
      }
    }
  }
  return s;
}

function buildInitialState(def: ComponentDef): State {
  const state: State = {};
  for (const sv of def.state) {
    switch (sv.type) {
      case "string":
        state[sv.id] = (sv.initialValue as string) ?? "";
        break;
      case "array":
        state[sv.id] = (sv.initialValue as MessageItem[]) ?? [];
        break;
      default:
        state[sv.id] = sv.initialValue as State[string];
    }
  }
  return state;
}

function reducer(state: State, action: { ops: Op[] }): State {
  return applyOps(state, action.ops);
}

// ---------- Block renderers ----------

function resolveValue(
  v: string | number | undefined,
  state: State
): string | number | undefined {
  if (typeof v === "string" && v.startsWith("${") && v.endsWith("}")) {
    const key = v.slice(2, -1);
    const sv = state[key];
    if (Array.isArray(sv)) return sv.length;
    return sv as string | number;
  }
  return v;
}

function formatTime(ts: number): string {
  return (
    new Date(ts).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + "." + String(ts % 1000).padStart(3, "0")
  );
}

function buildContextPayload(entries: LogEntry[]): string {
  const ordered = [...entries].reverse().map((entry) => ({
    role: entry.kind,
    content: entry.message,
  }));
  return JSON.stringify(ordered, null, 2);
}

function getFirstNonSystemIndex(steps: ScenarioStep[]): number {
  let idx = 0;
  while (steps[idx] && steps[idx].type === "system") idx += 1;
  return idx;
}

// Sub-components that need local state

type SubProps = {
  block: BlockDef;
  state: State;
  runAction: (id: string) => void;
  dispatchOps: (ops: Op[]) => void;
  def: ComponentDef;
  scenarioHandlers: ScenarioHandlers;
};

type ScenarioHandlers = {
  scenario?: ScenarioDef;
  startScenario: (autoPlay: boolean) => void;
  advanceUserChar: (stateId: string, manual: boolean) => void;
};

function TabsBlock({ block, state, runAction, dispatchOps, def, scenarioHandlers }: SubProps) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="demo-tabs">
      <div className="demo-tab-bar">
        {block.props.tabLabels?.map((label, i) => (
          <button
            key={i}
            className={`demo-tab-btn${i === activeTab ? " demo-tab-btn-active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="demo-tab-content">
        {(block.props.tabContents?.[activeTab] ?? []).map((c) =>
          renderBlock(c, state, runAction, dispatchOps, def, scenarioHandlers)
        )}
      </div>
    </div>
  );
}

function PanelBlock({ block, state, runAction, dispatchOps, def, scenarioHandlers }: SubProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`demo-panel${block.props.fillHeight ? " demo-panel-fill" : ""}`}>
      {block.props.title && (
        <div className="demo-panel-title">
          <span>{block.props.title}</span>
          {block.props.collapsible && (
            <button className="demo-panel-toggle" onClick={() => setOpen(!open)}>
              {open ? "▲" : "▼"}
            </button>
          )}
        </div>
      )}
      {open && (
        <div
          style={{
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: 0,
            flex: block.props.fillHeight ? "1 1 auto" : undefined,
            minHeight: block.props.fillHeight ? 0 : undefined,
          }}
        >
          {block.children?.map((c) => renderBlock(c, state, runAction, dispatchOps, def, scenarioHandlers))}
        </div>
      )}
    </div>
  );
}

function ChatInputBlock({ block, state, runAction, dispatchOps, scenarioHandlers }: SubProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stateId = block.props.inputState ?? "input";
  const value = String(state[stateId] ?? "");
  const autoSendOnInput = Boolean(block.props.autoSendOnInput);
  const sendAction = block.props.sendAction ?? "send";
  const awaitingSend = Boolean(state.scenarioAwaitingSend);
  let isSendDisabled = block.props.disabledWhen
    ? Boolean(state[block.props.disabledWhen])
    : false;
  if (scenarioHandlers.scenario && awaitingSend) {
    isSendDisabled = false;
  }

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const len = value.length;
    try {
      input.setSelectionRange(len, len);
    } catch {
      // noop for unsupported input types
    }
    input.scrollLeft = input.scrollWidth;
  }, [value]);

  return (
    <div className="demo-chat-input-row">
      <input
        ref={inputRef}
        type="text"
        className="demo-chat-input"
        value={value}
        placeholder={block.props.placeholder ?? "Type a message…"}
        onChange={(e) => {
          const nextValue = e.target.value;
          if (autoSendOnInput && scenarioHandlers.scenario) return;
          dispatchOps([{ type: "set-string", target: stateId, value: nextValue }]);
        }}
        onKeyDown={(e) => {
          if (autoSendOnInput && scenarioHandlers.scenario) {
            if (awaitingSend) {
              if (e.key === "Enter") {
                e.preventDefault();
                runAction(sendAction);
              }
              return;
            }
            if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace") {
              e.preventDefault();
              scenarioHandlers.advanceUserChar(stateId, true);
            }
            return;
          }
          if (isSendDisabled) return;
          if (e.key === "Enter" && !e.shiftKey && value.trim()) {
            e.preventDefault();
            runAction(sendAction);
          }
        }}
      />
      <button
        className="demo-btn"
        disabled={isSendDisabled}
        onClick={() => {
          if (autoSendOnInput && scenarioHandlers.scenario) {
            if (awaitingSend) {
              runAction(sendAction);
              return;
            }
            scenarioHandlers.startScenario(false);
            return;
          }
          value.trim() && runAction(sendAction);
        }}
      >
        {block.props.label ?? "Send"}
      </button>
    </div>
  );
}

function renderBlock(
  block: BlockDef,
  state: State,
  runAction: (id: string) => void,
  dispatchOps: (ops: Op[]) => void,
  def: ComponentDef,
  scenarioHandlers: ScenarioHandlers
): ReactNode {
  // Universal visibleWhen guard
  if (block.props.visibleWhen !== undefined && !state[block.props.visibleWhen]) return null;

  const children = block.children?.map((c) =>
    renderBlock(c, state, runAction, dispatchOps, def, scenarioHandlers)
  );

  switch (block.type) {
    case "stat": {
      const label = resolveValue(block.props.label, state);
      const value = resolveValue(block.props.value, state);
      if (block.props.value?.toString().startsWith("${") && typeof value === "number" && value > 0) {
        const timeLeft = Math.max(0, (value - Date.now()) / 1000).toFixed(1);
        return (
          <div key={block.id} className="demo-window-info">
            <span className="demo-window-count">{label}</span>
            <span className="demo-window-reset">resets in {timeLeft}s</span>
          </div>
        );
      }
      return (
        <div key={block.id} className="demo-window-info">
          <span className="demo-window-count">{label}</span>
        </div>
      );
    }

    case "progress-bar": {
      const value = resolveValue(block.props.value, state) ?? 0;
      const max = resolveValue(block.props.max, state) ?? 1;
      const pct = Math.max(0, Math.min(1, Number(value) / Number(max)));
      const fillClass =
        block.props.variant === "used"
          ? "demo-token-bar-fill demo-token-bar-fill-used"
          : "demo-token-bar-fill";
      const label = block.props.label
        ? String(block.props.label).replace(/\$\{(\w+)\}/g, (_, key) => {
            const sv = state[key];
            if (typeof sv === "number") return Math.floor(sv).toString();
            if (Array.isArray(sv)) return sv.length.toString();
            return String(sv ?? "");
          })
        : undefined;
      return (
        <div key={block.id} className="demo-token-bar-wrap">
          <div className="demo-token-bar">
            <div className={fillClass} style={{ transform: `scaleX(${pct})` }} />
          </div>
          {label && <span className="demo-token-label">{label}</span>}
        </div>
      );
    }

    case "button": {
      const isDisabled = block.props.disabledWhen
        ? Boolean(state[block.props.disabledWhen])
        : false;
      return (
        <button
          key={block.id}
          className="demo-btn"
          disabled={isDisabled}
          onClick={() => !isDisabled && runAction(block.props.action ?? "")}
        >
          {block.props.label}
        </button>
      );
    }

    case "event-log": {
      const entries = (state[block.props.source ?? "log"] as LogEntry[]) ?? [];
      return (
        <ul key={block.id} className="demo-timeline">
          {entries.map((e, i) => (
            <li
              key={i}
              className={`demo-event ${
                e.kind === "allowed"
                  ? "demo-event-allowed"
                  : e.kind === "blocked"
                  ? "demo-event-blocked"
                  : ""
              }`}
            >
              <span className="demo-event-time">{formatTime(e.time)}</span>
              <span className="demo-event-icon">
                {e.kind === "allowed" ? "✓" : e.kind === "blocked" ? "✗" : "·"}
              </span>
              <span className="demo-event-label">{e.message}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "slider": {
      const stateId = block.props.stateId ?? block.props.action ?? "";
      const value = Number(state[stateId] ?? 0);
      return (
        <label key={block.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {block.props.label && <span>{block.props.label}</span>}
          <input
            type="range"
            min={block.props.min ?? 0}
            max={Number(block.props.max ?? 100)}
            step={block.props.step ?? 1}
            value={value}
            onChange={(e) =>
              dispatchOps([{ type: "set", target: stateId, value: Number(e.target.value) }])
            }
          />
          <span>{value}</span>
        </label>
      );
    }

    case "text":
      return (
        <p key={block.id} className="mdx-p">
          {block.props.content}
        </p>
      );

    case "divider":
      return <hr key={block.id} className="mdx-hr" />;

    case "row":
      return (
        <div key={block.id} className="demo-controls">
          {children}
        </div>
      );

    case "column":
      return (
        <div
          key={block.id}
          className="demo-body"
          style={{ minWidth: block.props.minWidth }}
        >
          {children}
        </div>
      );

    case "chat-feed": {
      const raw = (state[block.props.source ?? "messages"] as (LogEntry | MessageItem)[]) ?? [];
      // log type (prepended, newest-first) → reverse for chat display
      // array type (appended, oldest-first) → display as-is
      const msgs = raw.length > 0 && "kind" in raw[0] ? [...raw].reverse() : raw;
      return (
        <div key={block.id} className="demo-chat-feed">
          {msgs.map((item, i) => {
            const isLog = "kind" in item;
            const role = isLog ? (item as LogEntry).kind : (item as MessageItem).role;
            const content = isLog ? (item as LogEntry).message : (item as MessageItem).content;
            const toolName = !isLog ? (item as MessageItem).toolName : undefined;
            return (
              <div key={i} className={`demo-chat-bubble demo-chat-bubble-${role}`}>
                {toolName && <span className="demo-chat-tool-name">{toolName}</span>}
                <span className="demo-chat-content">{content}</span>
                {block.props.showTimestamps && (
                  <span className="demo-chat-time">
                    {formatTime(isLog ? (item as LogEntry).time : (item as MessageItem).id)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case "chat-input": {
      return (
        <ChatInputBlock
          key={block.id}
          block={block}
          state={state}
          runAction={runAction}
          dispatchOps={dispatchOps}
          def={def}
          scenarioHandlers={scenarioHandlers}
        />
      );
    }

    case "mermaid-block": {
      const chart = block.props.source
        ? String(state[block.props.source] ?? "")
        : (block.props.mermaid ?? "");
      if (!chart.trim()) return null;
      return <div key={block.id}><MermaidDiagram chart={chart} /></div>;
    }

    case "svg-block": {
      const frame = block.props.frameState
        ? Number(state[block.props.frameState] ?? 0)
        : undefined;
      return (
        <div
          key={block.id}
          className={["demo-svg-block", block.props.animationClass].filter(Boolean).join(" ")}
          style={{
            width: block.props.width,
            height: block.props.height,
            ...(frame !== undefined ? { "--anim-frame": frame } as React.CSSProperties : {}),
          }}
          // svgContent is admin-authored (set in DB), never from runtime user input
          dangerouslySetInnerHTML={{ __html: block.props.svgContent ?? "" }}
        />
      );
    }

    case "typing-indicator":
      return (
        <div key={block.id} className="demo-typing">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="demo-typing-dot"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      );

    case "code-display": {
      let text: string;
      if (block.props.source) {
        const raw = state[block.props.source];
        text = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
      } else {
        text = block.props.content ?? "";
      }
      const heightProp = block.props.height;
      const height =
        heightProp === undefined
          ? "240px"
          : typeof heightProp === "number"
          ? `${heightProp}px`
          : heightProp;
      const isAutoHeight = height === "auto";
      return (
        <div key={block.id} className="code-block">
          {block.props.language && (
            <div className="code-block-header">
              <span className="code-lang">{block.props.language}</span>
            </div>
          )}
          <pre
            style={{
              overflowY: isAutoHeight ? "visible" : "auto",
              overflowX: "auto",
              height,
              margin: 0,
              maxWidth: "100%",
            }}
          >
            <code>{text}</code>
          </pre>
        </div>
      );
    }

    case "request-log": {
      const raw = (state[block.props.source ?? "contextRequests"] as ContextRequestItem[]) ?? [];
      return (
        <div key={block.id} className="demo-request-log">
          {raw.map((item, i) => (
            <details key={item.id ?? i} className="demo-request-item">
              <summary className="demo-request-summary">
                {item.title ?? `Request ${i + 1}`}
                {item.tokenCount !== undefined
                  ? ` · ${Math.round(item.tokenCount).toLocaleString("en-US")} tokens`
                  : ""}
              </summary>
              <pre className="demo-request-pre">
                <code>{item.content}</code>
              </pre>
            </details>
          ))}
        </div>
      );
    }

    case "split":
      return (
        <div key={block.id} className="demo-split">
          {children}
        </div>
      );

    case "panel":
      return (
        <PanelBlock
          key={block.id}
          block={block}
          state={state}
          runAction={runAction}
          dispatchOps={dispatchOps}
          def={def}
          scenarioHandlers={scenarioHandlers}
        />
      );

    case "tabs":
      return (
        <TabsBlock
          key={block.id}
          block={block}
          state={state}
          runAction={runAction}
          dispatchOps={dispatchOps}
          def={def}
          scenarioHandlers={scenarioHandlers}
        />
      );

    case "card":
      return (
        <div key={block.id} className="demo-card">
          {block.props.title && <div className="demo-card-title">{block.props.title}</div>}
          {children}
        </div>
      );

    case "grid":
      return (
        <div
          key={block.id}
          className="demo-grid"
          style={{ "--cols": block.props.columns ?? 2, gap: block.props.gap } as React.CSSProperties}
        >
          {children}
        </div>
      );

    case "badge": {
      const variantClass = block.props.variant ? ` demo-badge-${block.props.variant}` : "";
      return (
        <span key={block.id} className={`demo-badge-inline${variantClass}`}>
          {block.props.label}
        </span>
      );
    }

    case "avatar": {
      const initials = (block.props.role ?? block.props.label ?? "?")[0].toUpperCase();
      return (
        <div key={block.id} className="demo-avatar">
          {initials}
        </div>
      );
    }

    case "pill":
      return (
        <span key={block.id} className="demo-pill">
          {block.props.label}
        </span>
      );

    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={block.id}
          src={block.props.src ?? ""}
          alt={block.props.alt ?? ""}
          width={block.props.width}
          height={block.props.height}
          style={{ maxWidth: "100%" }}
        />
      );

    case "list-block": {
      const rawItems = block.props.items ? state[block.props.items] : undefined;
      const items = Array.isArray(rawItems) ? rawItems : [];
      return (
        <ul key={block.id} className="demo-list">
          {items.map((item, i) => (
            <li key={i} className="demo-list-item">{String(item)}</li>
          ))}
        </ul>
      );
    }

    case "line-chart": {
      const data = (state[block.props.source ?? ""] as number[]) ?? [];

      const W = 280, H = 160, PL = 40, PR = 12, PT = 16, PB = 24;
      const plotW = W - PL - PR;
      const plotH = H - PT - PB;

      const cumulative: number[] = [];
      let sum = 0;
      for (const v of data) { sum += v; cumulative.push(sum); }

      const n = data.length;
      const yMax = Math.max(...cumulative, 1);
      const xAt = (i: number) => PL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
      const yAt = (v: number) => PT + plotH - (v / yMax) * plotH;

      const pts1 = data.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
      const pts2 = cumulative.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
      const gridVals = [0, Math.round(yMax / 2), yMax];

      if (data.length === 0) {
        return (
          <svg key={block.id} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", aspectRatio: `${W} / ${H}` }}>
            <line x1={PL} y1={PT} x2={PL} y2={PT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1={PL} y1={PT + plotH} x2={W - PR} y2={PT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x={(PL + W - PR) / 2} y={PT + plotH / 2} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.2)">send a message to start</text>
            <line x1={PL + 4} y1={PT + 6} x2={PL + 18} y2={PT + 6} stroke="#89b4fa" strokeWidth="1.5" />
            <text x={PL + 22} y={PT + 10} fontSize="8" fill="#89b4fa">this call</text>
            <line x1={PL + 68} y1={PT + 6} x2={PL + 82} y2={PT + 6} stroke="#fab387" strokeWidth="1.5" />
            <text x={PL + 86} y={PT + 10} fontSize="8" fill="#fab387">cumulative</text>
          </svg>
        );
      }

      return (
        <svg key={block.id} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", aspectRatio: `${W} / ${H}` }}>
          {gridVals.map((v, i) => (
            <line key={i} x1={PL} y1={yAt(v)} x2={W - PR} y2={yAt(v)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          ))}
          <line x1={PL} y1={PT} x2={PL} y2={PT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={PL} y1={PT + plotH} x2={W - PR} y2={PT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {gridVals.map((v, i) => (
            <text key={i} x={PL - 4} y={yAt(v) + 4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.35)">
              {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            </text>
          ))}
          {data.map((_, i) => (
            <text key={i} x={xAt(i)} y={H - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">{i + 1}</text>
          ))}
          {n > 1 && <polyline points={pts1} fill="none" stroke="#89b4fa" strokeWidth="1.5" strokeLinejoin="round" />}
          {n > 1 && <polyline points={pts2} fill="none" stroke="#fab387" strokeWidth="1.5" strokeLinejoin="round" />}
          {data.map((v, i) => <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2.5" fill="#89b4fa" />)}
          {cumulative.map((v, i) => <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2.5" fill="#fab387" />)}
          <line x1={PL + 4} y1={PT + 6} x2={PL + 18} y2={PT + 6} stroke="#89b4fa" strokeWidth="1.5" />
          <text x={PL + 22} y={PT + 10} fontSize="8" fill="#89b4fa">this call</text>
          <line x1={PL + 68} y1={PT + 6} x2={PL + 82} y2={PT + 6} stroke="#fab387" strokeWidth="1.5" />
          <text x={PL + 86} y={PT + 10} fontSize="8" fill="#fab387">cumulative</text>
        </svg>
      );
    }

    default:
      return null;
  }
}

export function DynamicComponentClient({ definition }: { definition: ComponentDef }) {
  const [state, dispatch] = useReducer(reducer, definition, buildInitialState);
  const scenario = definition.scenario;
  const scenarioTimersRef = useRef<number[]>([]);
  const scheduledStepRef = useRef<number | null>(null);
  const scheduledSendRef = useRef<number | null>(null);

  const clearScenarioTimers = useCallback(() => {
    scenarioTimersRef.current.forEach((t) => clearTimeout(t));
    scenarioTimersRef.current = [];
  }, []);

  const dispatchOps = useCallback(
    (ops: Op[]) => dispatch({ ops }),
    []
  );

  const appendTokenOps = useCallback(
    (ops: Op[], delta?: number) => {
      if (!scenario?.tokenStateId || delta === undefined) return;
      ops.push({ type: "increment", target: scenario.tokenStateId, delta });
      if (scenario.tokenHistoryId) {
        ops.push({ type: "push-state", target: scenario.tokenHistoryId, source: scenario.tokenStateId });
      }
    },
    [scenario]
  );

  const startScenario = useCallback(
    (autoPlay: boolean) => {
      if (!scenario) return;
      if (state.scenarioStarted) return;
      const ops: Op[] = [
        { type: "set", target: "scenarioStarted", value: true },
        { type: "set", target: "scenarioRunning", value: true },
        { type: "set", target: "autoPlay", value: autoPlay },
        { type: "set", target: "scenarioChar", value: 0 },
        { type: "set", target: "scenarioAwaitingSend", value: false },
      ];
      const inputStateId = scenario.inputStateId ?? "input";
      ops.push({ type: "clear-string", target: inputStateId });

      const steps = scenario.steps ?? [];
      let idx = 0;
      while (steps[idx]) {
        const step = steps[idx];
        if (step.type !== "system") break;
        ops.push({ type: "append-log", target: "messages", kind: "system", template: step.text });
        appendTokenOps(ops, step.tokenDelta);
        idx += 1;
      }
      ops.push({ type: "set", target: "scenarioStep", value: idx });
      dispatchOps(ops);
    },
    [scenario, state.scenarioStarted, dispatchOps, appendTokenOps]
  );

  const advanceUserChar = useCallback(
    (stateId: string, manual: boolean) => {
      if (!scenario) return;
      const steps = scenario.steps ?? [];
      const started = Boolean(state.scenarioStarted);
      const stepIndex = started ? Number(state.scenarioStep ?? 0) : getFirstNonSystemIndex(steps);
      const step = steps[stepIndex];
      if (!started) {
        startScenario(false);
      }
      if (!step || step.type !== "user") return;
      const currentIndex = started ? Number(state.scenarioChar ?? 0) : 0;
      if (currentIndex >= step.text.length) return;
      const nextIndex = Math.min(step.text.length, currentIndex + 1);
      const nextValue = step.text.slice(0, nextIndex);
      const ops: Op[] = [
        { type: "set-string", target: stateId, value: nextValue },
        { type: "set", target: "scenarioChar", value: nextIndex },
      ];
      if (manual && state.autoPlay) {
        ops.unshift({ type: "set", target: "autoPlay", value: false });
      }
      if (nextIndex >= step.text.length) {
        ops.push({ type: "set", target: "scenarioAwaitingSend", value: true });
      }
      dispatchOps(ops);
    },
    [scenario, state, dispatchOps, startScenario]
  );

  const commitUserStep = useCallback(() => {
    if (!scenario) return;
    const steps = scenario.steps ?? [];
    const stepIndex = Number(state.scenarioStep ?? 0);
    const step = steps[stepIndex];
    if (!step || step.type !== "user") return;
    const inputStateId = scenario.inputStateId ?? "input";
    const existing = (state.messages as LogEntry[]) ?? [];
    const userEntry: LogEntry = { time: Date.now(), kind: "user", message: step.text };
    const nextMessages = [userEntry, ...existing];
    const requestPayload = buildContextPayload(nextMessages);
    const requestCount = Array.isArray(state.contextRequests)
      ? (state.contextRequests as ContextRequestItem[]).length + 1
      : 1;
    const tokenStateId = scenario.tokenStateId;
    const currentToken =
      tokenStateId && typeof state[tokenStateId] === "number"
        ? (state[tokenStateId] as number)
        : undefined;
    const nextToken =
      currentToken !== undefined ? currentToken + (step.tokenDelta ?? 0) : undefined;
    const ops: Op[] = [
      { type: "append-log", target: "messages", kind: "user", template: step.text },
      {
        type: "push",
        target: "contextRequests",
        value: {
          id: Date.now(),
          title: `Request ${requestCount}`,
          content: requestPayload,
          tokenCount: nextToken,
        },
      },
      { type: "clear-string", target: inputStateId },
      { type: "set", target: "scenarioChar", value: 0 },
      { type: "set", target: "scenarioAwaitingSend", value: false },
      { type: "increment", target: "scenarioStep", delta: 1 },
    ];
    appendTokenOps(ops, step.tokenDelta);
    dispatchOps(ops);
    scheduledSendRef.current = null;
  }, [scenario, state, dispatchOps, appendTokenOps]);

  const runAction = useCallback(
    (id: string) => {
      if (scenario && id === "send") {
        if (state.scenarioRunning && state.scenarioAwaitingSend) {
          commitUserStep();
          return;
        }
        if (!state.scenarioStarted) {
          startScenario(false);
          return;
        }
      }
      if (scenario && id === "autoPlay") {
        if (!state.scenarioStarted) {
          startScenario(true);
          return;
        }
        dispatchOps([{ type: "set", target: "autoPlay", value: true }]);
        return;
      }
      const ops = definition.actions.find((a) => a.id === id)?.ops ?? [];
      const syncBatch: Op[] = [];
      for (const op of ops) {
        if (op.type === "delay-then") {
          if (syncBatch.length) {
            dispatch({ ops: [...syncBatch] });
            syncBatch.length = 0;
          }
          const { delayMs, ops: delayed } = op;
          setTimeout(() => dispatch({ ops: delayed }), delayMs);
        } else {
          syncBatch.push(op);
        }
      }
      if (syncBatch.length) dispatch({ ops: syncBatch });
    },
    [definition, scenario, startScenario, state, commitUserStep, dispatchOps]
  );

  useEffect(() => {
    if (!scenario || !state.scenarioRunning) {
      clearScenarioTimers();
      scheduledStepRef.current = null;
      scheduledSendRef.current = null;
      return;
    }
    const steps = scenario.steps ?? [];
    const stepIndex = Number(state.scenarioStep ?? 0);
    const step = steps[stepIndex];
    if (!step) {
      dispatchOps([
        { type: "set", target: "scenarioRunning", value: false },
        { type: "set", target: "autoPlay", value: false },
        { type: "set", target: "scenarioAwaitingSend", value: false },
      ]);
      scheduledStepRef.current = null;
      scheduledSendRef.current = null;
      return;
    }
    if (step.type === "user") {
      scheduledStepRef.current = null;
      return;
    }
    if (scheduledStepRef.current === stepIndex) return;
    scheduledStepRef.current = stepIndex;

    if (step.type === "pause") {
      const timeoutId = window.setTimeout(() => {
        dispatchOps([{ type: "increment", target: "scenarioStep", delta: 1 }]);
      }, step.ms);
      scenarioTimersRef.current.push(timeoutId);
      return;
    }

    const delayMs =
      step.delayMs ??
      (step.type === "assistant"
        ? scenario.assistantDelayMs ?? 400
        : step.type === "tool"
        ? scenario.toolDelayMs ?? 450
        : scenario.systemDelayMs ?? 0);

    if (step.type === "assistant") {
      const typingMs = step.typingMs ?? scenario.assistantTypingMs ?? 900;
      dispatchOps([{ type: "set", target: "typing", value: true }]);
      const timeoutId = window.setTimeout(() => {
        const ops: Op[] = [
          { type: "set", target: "typing", value: false },
          { type: "append-log", target: "messages", kind: "assistant", template: step.text },
          { type: "increment", target: "scenarioStep", delta: 1 },
        ];
        appendTokenOps(ops, step.tokenDelta);
        dispatchOps(ops);
      }, delayMs + typingMs);
      scenarioTimersRef.current.push(timeoutId);
      return;
    }

    if (step.type === "tool" || step.type === "system") {
      const timeoutId = window.setTimeout(() => {
        const ops: Op[] = [
          { type: "append-log", target: "messages", kind: step.type, template: step.text },
          { type: "increment", target: "scenarioStep", delta: 1 },
        ];
        appendTokenOps(ops, step.tokenDelta);
        // Tool results trigger a new API request with the full context (tool result appended).
        // Capture that payload into contextRequests so request-log panels update.
        if (step.type === "tool") {
          const existing = (state.messages as LogEntry[]) ?? [];
          const toolEntry: LogEntry = { time: Date.now(), kind: "tool", message: step.text };
          const nextMessages = [toolEntry, ...existing];
          const requestPayload = buildContextPayload(nextMessages);
          const requestCount = Array.isArray(state.contextRequests)
            ? (state.contextRequests as ContextRequestItem[]).length + 1
            : 1;
          const tokenStateId = scenario.tokenStateId;
          const currentToken =
            tokenStateId && typeof state[tokenStateId] === "number"
              ? (state[tokenStateId] as number)
              : undefined;
          const nextToken =
            currentToken !== undefined && step.tokenDelta !== undefined
              ? currentToken + step.tokenDelta
              : currentToken;
          ops.push({
            type: "push",
            target: "contextRequests",
            value: {
              id: Date.now(),
              title: `Request ${requestCount}`,
              content: requestPayload,
              tokenCount: nextToken,
            },
          });
        }
        dispatchOps(ops);
      }, delayMs);
      scenarioTimersRef.current.push(timeoutId);
    }
  }, [scenario, state.scenarioRunning, state.scenarioStep, dispatchOps, appendTokenOps, clearScenarioTimers]);

  useEffect(() => {
    if (!scenario || !state.autoPlay || !state.scenarioRunning) return;
    const steps = scenario.steps ?? [];
    const stepIndex = Number(state.scenarioStep ?? 0);
    const step = steps[stepIndex];
    if (!step || step.type !== "user") return;
    if (Number(state.scenarioChar ?? 0) >= step.text.length) return;
    const delayMs =
      Number(state.scenarioChar ?? 0) === 0
        ? scenario.autoPlayDelayMs ?? 600
        : scenario.userTypingMs ?? 70;
    const inputStateId = scenario.inputStateId ?? "input";
    const timeoutId = window.setTimeout(() => {
      advanceUserChar(inputStateId, false);
    }, delayMs);
    scenarioTimersRef.current.push(timeoutId);
  }, [
    scenario,
    state.autoPlay,
    state.scenarioRunning,
    state.scenarioStep,
    state.scenarioChar,
    advanceUserChar,
  ]);

  useEffect(() => {
    if (!scenario || !state.autoPlay || !state.scenarioRunning || !state.scenarioAwaitingSend) {
      scheduledSendRef.current = null;
      return;
    }
    const steps = scenario.steps ?? [];
    const stepIndex = Number(state.scenarioStep ?? 0);
    const step = steps[stepIndex];
    if (!step || step.type !== "user") return;
    if (Number(state.scenarioChar ?? 0) < step.text.length) return;
    if (scheduledSendRef.current === stepIndex) return;
    scheduledSendRef.current = stepIndex;
    const delayMs = scenario.autoPlayDelayMs ?? 600;
    const timeoutId = window.setTimeout(() => {
      commitUserStep();
    }, delayMs);
    scenarioTimersRef.current.push(timeoutId);
  }, [
    scenario,
    state.autoPlay,
    state.scenarioRunning,
    state.scenarioAwaitingSend,
    state.scenarioStep,
    state.scenarioChar,
    commitUserStep,
  ]);

  useEffect(() => {
    const timers = definition.timers?.map((t) =>
      setInterval(() => runAction(t.action), t.intervalMs)
    );
    return () => timers?.forEach(clearInterval);
  }, [definition, runAction]);

  const scenarioHandlers: ScenarioHandlers = {
    scenario,
    startScenario,
    advanceUserChar,
  };

  return (
    <div className="demo-shell">
      <div className="demo-shell-header">
        <span className="demo-title">{definition.name}</span>
        <span className="demo-badge">Interactive</span>
      </div>
      <div className="demo-body">
        {definition.blocks.map((b) => renderBlock(b, state, runAction, dispatchOps, definition, scenarioHandlers))}
      </div>
    </div>
  );
}
