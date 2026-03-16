import React from "react";

export default function WidgetSchemaDocsPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="section-title" style={{ marginBottom: "2rem" }}>Widget Schema Reference</h1>

        <DocsSection title="Overview">
          <p className="admin-docs-desc">
            A widget is a JSON document that describes interactive UI: state variables, actions
            that mutate state, blocks that render state, optional timers, and an optional scripted
            scenario. The runtime interpreter (<code>DynamicComponentClient</code>) reads it and
            produces a live React component. Embed a widget in a post with:
          </p>
          <Pre>{`<DynamicComponent id="your-widget-id" />`}</Pre>
          <p className="admin-docs-desc">Top-level shape:</p>
          <Pre>{`{
  "name": "My Widget",          // display name
  "description": "...",         // optional summary
  "state": [...],               // state variables
  "timers": [...],              // optional: periodic action triggers
  "actions": [...],             // named lists of ops that mutate state
  "blocks": [...],              // UI blocks that render state
  "scenario": {...}             // optional: scripted walkthrough
}`}</Pre>
        </DocsSection>

        <DocsSection title="State variables">
          <p className="admin-docs-desc">
            Each entry in <code>state</code> declares a named variable. The runtime initialises it
            to <code>initialValue</code> and exposes it to blocks and actions by <code>id</code>.
          </p>
          <Pre>{`{ "id": "count",      "type": "number",     "initialValue": 0, "min": 0, "max": 10 }
{ "id": "running",    "type": "boolean",    "initialValue": false }
{ "id": "input",      "type": "string",     "initialValue": "" }
{ "id": "log",        "type": "log",        "initialValue": [] }
{ "id": "timestamps", "type": "timestamps", "initialValue": [] }
{ "id": "messages",   "type": "array",      "initialValue": [] }`}</Pre>
          <p className="admin-docs-desc">
            <strong>Note:</strong> <code>min</code>/<code>max</code> on <code>number</code> types
            are metadata only — the runtime does <em>not</em> auto-clamp. Add a{" "}
            <code>clamp</code> op to enforce bounds.
          </p>
          <p className="admin-docs-desc">Types at a glance:</p>
          <Pre>{`number      — numeric; displayed with toFixed(2) in stat blocks
boolean     — true/false; used with toggle op and visibleWhen/disabledWhen props
string      — mutable text; written by chat-input or set-string/clear-string ops
log         — LogEntry[]; rendered by event-log and request-log blocks
timestamps  — number[] of epoch-ms; used by rate-limiter ops
array       — generic array; holds MessageItem[] or ContextRequestItem[]`}</Pre>
        </DocsSection>

        <DocsSection title="Timers">
          <p className="admin-docs-desc">
            Each timer fires its <code>action</code> every <code>intervalMs</code> milliseconds
            via <code>setInterval</code> in the client. Keep intervals ≥ 100 ms.
          </p>
          <Pre>{`{ "intervalMs": 100, "action": "refill" }`}</Pre>
        </DocsSection>

        <DocsSection title="Actions and ops">
          <p className="admin-docs-desc">
            An action is a named list of ops. It is triggered by a button&apos;s <code>action</code>{" "}
            prop, a timer&apos;s <code>action</code> field, or a scenario step.
          </p>
          <Pre>{`{ "id": "sendRequest", "ops": [ ... ] }`}</Pre>

          <h3 className="admin-docs-subheading">Numeric</h3>
          <Pre>{`{ "type": "set",       "target": "count", "value": 0 }
{ "type": "increment", "target": "count", "delta": 0.05 }   // delta defaults to 1
{ "type": "decrement", "target": "count", "delta": 1 }
{ "type": "reset",     "target": "count" }                  // sets to 0 / false / "" / []
{ "type": "clamp",     "target": "count", "min": 0, "max": 10 }
{ "type": "mod",       "target": "step",  "modulus": 4 }`}</Pre>

          <h3 className="admin-docs-subheading">Boolean</h3>
          <Pre>{`{ "type": "toggle", "target": "running" }`}</Pre>

          <h3 className="admin-docs-subheading">String</h3>
          <Pre>{`{ "type": "set-string",   "target": "input", "value": "hello" }
{ "type": "clear-string", "target": "input" }`}</Pre>

          <h3 className="admin-docs-subheading">Log / array</h3>
          <Pre>{`// Append a log entry — template supports \${stateId} interpolation
{ "type": "append-log", "target": "log", "template": "Request \${count}", "kind": "allowed" }
// kind: "allowed" | "blocked" | "info" | "user" | "assistant" | "system" | "tool"
// fromState: read message text from a string state var instead of template

{ "type": "push",  "target": "items", "value": "new item" }
{ "type": "pop",   "target": "items" }

// Append a chat message (role required; content or fromState)
{ "type": "append-message", "target": "messages", "role": "user", "fromState": "input" }
{ "type": "append-message", "target": "messages", "role": "tool", "content": "done", "toolName": "search" }

// Push current value of source onto target array
{ "type": "push-state", "target": "tokenHistory", "source": "tokens" }

// Add numeric value of source to target
{ "type": "increment-by-state", "target": "totalSpent", "source": "tokens" }`}</Pre>

          <h3 className="admin-docs-subheading">Timestamps (rate limiters)</h3>
          <Pre>{`{ "type": "append-timestamp", "target": "timestamps" }
{ "type": "prune-timestamps", "target": "timestamps", "windowMs": 60000 }
{ "type": "set-window-end",   "target": "windowEnd",  "windowMs": 60000 }`}</Pre>

          <h3 className="admin-docs-subheading">Control flow</h3>
          <Pre>{`// Conditional: left/right can be a literal or a state var id
{
  "type": "conditional",
  "condition": { "left": "tokens", "op": "gte", "right": 1 },
  "then": [ { "type": "decrement", "target": "tokens" } ],
  "else": [ { "type": "append-log", "target": "log", "template": "Blocked", "kind": "blocked" } ]
}
// op: "lt" | "lte" | "gt" | "gte" | "eq"
// Arrays and booleans resolve to their length / 0|1 in comparisons

// Non-blocking delay — outer action completes immediately
{ "type": "delay-then", "delayMs": 500, "ops": [ ... ] }`}</Pre>
        </DocsSection>

        <DocsSection title="Template interpolation">
          <p className="admin-docs-desc">
            Many string fields in block props (<code>label</code>, <code>content</code>,{" "}
            <code>title</code>) and <code>append-log</code>&apos;s <code>template</code> support{" "}
            <code>{"${stateId}"}</code> substitution. At render time the runtime replaces each
            token with the current value of that state variable.
          </p>
          <Pre>{`"label": "Tokens: \${tokens} / 5"
// Numbers → toFixed(2), booleans → "true"/"false", arrays → their length`}</Pre>
        </DocsSection>

        <DocsSection title="Block types">
          <p className="admin-docs-desc">
            Each block has <code>id</code>, <code>type</code>, <code>props</code>, and optional{" "}
            <code>children</code> (for layout blocks). Any block can use{" "}
            <code>{"visibleWhen: \"booleanStateId\""}</code> in props to hide when the named boolean is
            falsy.
          </p>

          <h3 className="admin-docs-subheading">Display</h3>
          <Pre>{`{ "type": "stat",         "props": { "label": "Count: \${count}" } }
{ "type": "text",         "props": { "content": "Static prose text." } }
{ "type": "badge",        "props": { "label": "Active", "variant": "success" } }
// variant: "info" | "success" | "warning" | "danger"
{ "type": "pill",         "props": { "label": "beta" } }
{ "type": "code-display", "props": { "source": "codeStateVar", "language": "json" } }
{ "type": "divider",      "props": {} }`}</Pre>

          <h3 className="admin-docs-subheading">Progress</h3>
          <Pre>{`{ "type": "progress-bar", "props": { "value": "tokens", "max": "5", "variant": "primary" } }`}</Pre>

          <h3 className="admin-docs-subheading">Layout</h3>
          <Pre>{`{ "type": "row",    "props": {},                              "children": [...] }
{ "type": "column", "props": {},                              "children": [...] }
{ "type": "grid",   "props": { "columns": 3, "gap": "8px" }, "children": [...] }
{ "type": "card",   "props": { "title": "My Card" },          "children": [...] }
{ "type": "panel",  "props": { "title": "Details", "collapsible": true }, "children": [...] }
{ "type": "split",  "props": {},                              "children": [left, right] }
{ "type": "tabs",   "props": { "tabLabels": ["A","B"], "tabContents": [[...],[...]] } }`}</Pre>

          <h3 className="admin-docs-subheading">Input</h3>
          <Pre>{`{ "type": "button", "props": { "label": "Send", "action": "sendRequest", "variant": "primary", "disabledWhen": "busy" } }
// variant: "primary" | "ghost" | "danger"
{ "type": "slider", "props": { "stateId": "speed", "min": 0, "max": 10, "step": 1, "label": "Speed" } }`}</Pre>

          <h3 className="admin-docs-subheading">Chat</h3>
          <Pre>{`{ "type": "chat-feed",       "props": { "source": "messages", "showTimestamps": true } }
{ "type": "chat-input",      "props": { "inputState": "input", "sendAction": "send", "placeholder": "Type…", "disabledWhen": "busy" } }
{ "type": "avatar",          "props": { "role": "assistant", "label": "AI" } }
{ "type": "typing-indicator","props": { "visibleWhen": "assistantTyping" } }`}</Pre>

          <h3 className="admin-docs-subheading">Data / rich</h3>
          <Pre>{`{ "type": "event-log",    "props": { "source": "log" } }
{ "type": "request-log",  "props": { "source": "log" } }
{ "type": "line-chart",   "props": { "source": "tokenHistory", "label": "Tokens" } }
{ "type": "list-block",   "props": { "items": "itemsStateVar" } }
{ "type": "mermaid-block","props": { "mermaid": "graph TD\\n  A-->B" } }
{ "type": "image",        "props": { "src": "/img.png", "alt": "…", "width": "100%" } }`}</Pre>
        </DocsSection>

        <DocsSection title="Scenario system">
          <p className="admin-docs-desc">
            Scenarios script a conversation walkthrough. The runtime auto-advances steps, handles
            typing delays, and manages token counting.
          </p>
          <Pre>{`"scenario": {
  "steps": [...],
  "inputStateId": "input",          // string state var the user types into
  "tokenStateId": "tokens",         // state var that accumulates token deltas
  "tokenHistoryId": "tokenHistory", // array that records token values per step
  "totalSpentId": "totalSpent",     // cumulative token total
  "autoPlayDelayMs": 800,           // ms before auto-playing user steps
  "userTypingMs": 40,               // ms per character for user typing simulation
  "assistantDelayMs": 600,          // initial pause before assistant reply
  "assistantTypingMs": 20,          // ms per character for assistant typing
  "toolDelayMs": 400,
  "systemDelayMs": 0
}`}</Pre>

          <h3 className="admin-docs-subheading">Step types</h3>
          <Pre>{`{ "type": "system",    "text": "You are a helpful assistant.", "tokenDelta": 10 }
{ "type": "user",      "text": "Hello!",         "tokenDelta": 5 }
{ "type": "assistant", "text": "Hi there!",      "tokenDelta": 8, "delayMs": 600, "typingMs": 20 }
{ "type": "tool",      "text": "search result",  "tokenDelta": 12 }
{ "type": "pause",     "ms": 1000 }`}</Pre>

          <p className="admin-docs-desc">
            The runtime injects these boolean state variables automatically when a scenario is
            present — do not declare them in <code>state[]</code>:
          </p>
          <Pre>{`scenarioStarted    — true once the scenario has begun
scenarioRunning    — true while a step is in progress
autoPlay           — true when auto-play mode is active
scenarioChar       — internal typing animation counter
scenarioAwaitingSend — true when waiting for the user to hit Send`}</Pre>
        </DocsSection>

        <DocsSection title="Worked example: token-bucket widget">
          <p className="admin-docs-desc">
            The simplest real widget. Tokens refill via a timer; each request consumes one.
          </p>
          <Pre>{`{
  "name": "Token Bucket Rate Limiter",
  "state": [
    { "id": "tokens", "type": "number", "initialValue": 5, "min": 0, "max": 5 },
    { "id": "log",    "type": "log",    "initialValue": [] }
  ],
  "timers": [
    { "intervalMs": 100, "action": "refill" }
  ],
  "actions": [
    {
      "id": "refill",
      "ops": [
        { "type": "increment", "target": "tokens", "delta": 0.05 },
        { "type": "clamp",     "target": "tokens", "min": 0, "max": 5 }
      ]
    },
    {
      "id": "sendRequest",
      "ops": [
        {
          "type": "conditional",
          "condition": { "left": "tokens", "op": "gte", "right": 1 },
          "then": [
            { "type": "decrement", "target": "tokens", "delta": 1 },
            { "type": "clamp",     "target": "tokens", "min": 0, "max": 5 },
            { "type": "append-log","target": "log", "template": "Allowed (\${tokens} left)", "kind": "allowed" }
          ],
          "else": [
            { "type": "append-log","target": "log", "template": "Rate limited", "kind": "blocked" }
          ]
        }
      ]
    }
  ],
  "blocks": [
    {
      "id": "bar-wrap", "type": "row", "props": {},
      "children": [
        { "id": "bar", "type": "progress-bar", "props": { "value": "tokens", "max": "5" } }
      ]
    },
    {
      "id": "controls", "type": "row", "props": {},
      "children": [
        { "id": "btn-send", "type": "button", "props": { "label": "Send Request", "action": "sendRequest" } }
      ]
    },
    { "id": "log-block", "type": "event-log", "props": { "source": "log" } }
  ]
}`}</Pre>
        </DocsSection>
      </div>
    </section>
  );
}

function DocsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-docs-section">
      <h2 className="admin-docs-heading">{title}</h2>
      {children}
    </div>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="admin-docs-pre"><code>{children}</code></pre>
  );
}
