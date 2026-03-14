import { createComponent, upsertComponent } from "@/lib/components";
import type { ComponentDef } from "@/types/component";

const tokenBucket: ComponentDef = {
  name: "Token Bucket Rate Limiter",
  description: "Visualises a token bucket algorithm: tokens refill continuously, each request consumes one.",
  state: [
    { id: "tokens", type: "number", initialValue: 5, min: 0, max: 5 },
    { id: "log", type: "log", initialValue: [] },
  ],
  timers: [
    { intervalMs: 100, action: "refill" },
  ],
  actions: [
    {
      id: "refill",
      ops: [
        { type: "increment", target: "tokens", delta: 0.05 },
        { type: "clamp", target: "tokens", min: 0, max: 5 },
      ],
    },
    {
      id: "sendRequest",
      ops: [
        {
          type: "conditional",
          condition: { left: "tokens", op: "gte", right: 1 },
          then: [
            { type: "decrement", target: "tokens", delta: 1 },
            { type: "clamp", target: "tokens", min: 0, max: 5 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
      ],
    },
    {
      id: "burst",
      ops: [
        {
          type: "conditional",
          condition: { left: "tokens", op: "gte", right: 1 },
          then: [
            { type: "decrement", target: "tokens", delta: 1 },
            { type: "clamp", target: "tokens", min: 0, max: 5 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
        {
          type: "conditional",
          condition: { left: "tokens", op: "gte", right: 1 },
          then: [
            { type: "decrement", target: "tokens", delta: 1 },
            { type: "clamp", target: "tokens", min: 0, max: 5 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
        {
          type: "conditional",
          condition: { left: "tokens", op: "gte", right: 1 },
          then: [
            { type: "decrement", target: "tokens", delta: 1 },
            { type: "clamp", target: "tokens", min: 0, max: 5 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
        {
          type: "conditional",
          condition: { left: "tokens", op: "gte", right: 1 },
          then: [
            { type: "decrement", target: "tokens", delta: 1 },
            { type: "clamp", target: "tokens", min: 0, max: 5 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
        {
          type: "conditional",
          condition: { left: "tokens", op: "gte", right: 1 },
          then: [
            { type: "decrement", target: "tokens", delta: 1 },
            { type: "clamp", target: "tokens", min: 0, max: 5 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
      ],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "tokens", value: 5 },
        { type: "set", target: "log", value: [] },
      ],
    },
  ],
  blocks: [
    {
      id: "bar-wrap",
      type: "column",
      props: {},
      children: [
        {
          id: "bar",
          type: "progress-bar",
          props: { value: "${tokens}", max: 5, label: "${tokens}/5 tokens", variant: "tokens" },
        },
      ],
    },
    {
      id: "controls",
      type: "row",
      props: {},
      children: [
        { id: "btn-send", type: "button", props: { label: "Send Request", action: "sendRequest" } },
        { id: "btn-burst", type: "button", props: { label: "Burst ×5", action: "burst" } },
        { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
      ],
    },
    {
      id: "log-block",
      type: "event-log",
      props: { source: "log" },
    },
  ],
};

const fixedWindow: ComponentDef = {
  name: "Fixed Window Rate Limiter",
  description: "Visualises a fixed window algorithm: requests counted per time-aligned window.",
  state: [
    { id: "count", type: "number", initialValue: 0, min: 0, max: 5 },
    { id: "windowEnd", type: "number", initialValue: 0 },
    { id: "log", type: "log", initialValue: [] },
  ],
  timers: [
    { intervalMs: 100, action: "tick" },
  ],
  actions: [
    {
      id: "tick",
      ops: [
        { type: "set-window-end", target: "windowEnd", windowMs: 10000 },
      ],
    },
    {
      id: "sendRequest",
      ops: [
        {
          type: "conditional",
          condition: { left: "count", op: "lt", right: 5 },
          then: [
            { type: "increment", target: "count", delta: 1 },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
      ],
    },
    {
      id: "burst",
      ops: [
        {
          type: "conditional",
          condition: { left: "count", op: "lt", right: 5 },
          then: [{ type: "increment", target: "count", delta: 1 }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "count", op: "lt", right: 5 },
          then: [{ type: "increment", target: "count", delta: 1 }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "count", op: "lt", right: 5 },
          then: [{ type: "increment", target: "count", delta: 1 }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "count", op: "lt", right: 5 },
          then: [{ type: "increment", target: "count", delta: 1 }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "count", op: "lt", right: 5 },
          then: [{ type: "increment", target: "count", delta: 1 }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
      ],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "count", value: 0 },
        { type: "set", target: "log", value: [] },
      ],
    },
  ],
  blocks: [
    {
      id: "window-info",
      type: "stat",
      props: { label: "${count}/5 requests this window", value: "${windowEnd}" },
    },
    {
      id: "bar-wrap",
      type: "column",
      props: {},
      children: [
        {
          id: "bar",
          type: "progress-bar",
          props: { value: "${count}", max: 5, variant: "used" },
        },
      ],
    },
    {
      id: "controls",
      type: "row",
      props: {},
      children: [
        { id: "btn-send", type: "button", props: { label: "Send Request", action: "sendRequest" } },
        { id: "btn-burst", type: "button", props: { label: "Burst ×5", action: "burst" } },
        { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
      ],
    },
    {
      id: "log-block",
      type: "event-log",
      props: { source: "log" },
    },
  ],
};

const slidingWindow: ComponentDef = {
  name: "Sliding Window Rate Limiter",
  description: "Visualises a sliding window algorithm: counts requests within a rolling time window.",
  state: [
    { id: "timestamps", type: "timestamps", initialValue: [] },
    { id: "log", type: "log", initialValue: [] },
  ],
  timers: [
    { intervalMs: 100, action: "prune" },
  ],
  actions: [
    {
      id: "prune",
      ops: [
        { type: "prune-timestamps", target: "timestamps", windowMs: 10000 },
      ],
    },
    {
      id: "sendRequest",
      ops: [
        { type: "prune-timestamps", target: "timestamps", windowMs: 10000 },
        {
          type: "conditional",
          condition: { left: "timestamps", op: "lt", right: 5 },
          then: [
            { type: "append-timestamp", target: "timestamps" },
            { type: "append-log", target: "log", template: "Allowed", kind: "allowed" },
          ],
          else: [
            { type: "append-log", target: "log", template: "Rate limited", kind: "blocked" },
          ],
        },
      ],
    },
    {
      id: "burst",
      ops: [
        { type: "prune-timestamps", target: "timestamps", windowMs: 10000 },
        {
          type: "conditional",
          condition: { left: "timestamps", op: "lt", right: 5 },
          then: [{ type: "append-timestamp", target: "timestamps" }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "timestamps", op: "lt", right: 5 },
          then: [{ type: "append-timestamp", target: "timestamps" }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "timestamps", op: "lt", right: 5 },
          then: [{ type: "append-timestamp", target: "timestamps" }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "timestamps", op: "lt", right: 5 },
          then: [{ type: "append-timestamp", target: "timestamps" }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
        {
          type: "conditional",
          condition: { left: "timestamps", op: "lt", right: 5 },
          then: [{ type: "append-timestamp", target: "timestamps" }, { type: "append-log", target: "log", template: "Allowed", kind: "allowed" }],
          else: [{ type: "append-log", target: "log", template: "Rate limited", kind: "blocked" }],
        },
      ],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "timestamps", value: [] },
        { type: "set", target: "log", value: [] },
      ],
    },
  ],
  blocks: [
    {
      id: "bar-wrap",
      type: "column",
      props: {},
      children: [
        {
          id: "bar",
          type: "progress-bar",
          props: { value: "${timestamps}", max: 5, label: "${timestamps}/5 in last 10s", variant: "used" },
        },
      ],
    },
    {
      id: "controls",
      type: "row",
      props: {},
      children: [
        { id: "btn-send", type: "button", props: { label: "Send Request", action: "sendRequest" } },
        { id: "btn-burst", type: "button", props: { label: "Burst ×5", action: "burst" } },
        { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
      ],
    },
    {
      id: "log-block",
      type: "event-log",
      props: { source: "log" },
    },
  ],
};

const messageRoles: ComponentDef = {
  name: "The Four Message Roles",
  description: "Tabbed view of the four LLM message roles — system, user, assistant, tool.",
  state: [],
  actions: [],
  blocks: [
    {
      id: "tabs",
      type: "tabs",
      props: {
        tabLabels: ["system", "user", "assistant", "tool"],
        tabContents: [
          [
            {
              id: "sys-desc",
              type: "text",
              props: { content: "Sets the model's persona, constraints, and task context.\nSent at position 0 on every request —\nit costs tokens on every single call." },
            },
            {
              id: "sys-code",
              type: "code-display",
              props: {
                language: "json",
                content: '{\n  "role": "system",\n  "content": "You are a code review assistant.\n    Focus on correctness, security, and performance."\n}',
              },
            },
          ],
          [
            {
              id: "usr-desc",
              type: "text",
              props: { content: "The human's input. Each turn appends a new user object.\nThe model sees every prior user message,\nnot just the latest one." },
            },
            {
              id: "usr-code",
              type: "code-display",
              props: {
                language: "json",
                content: '{\n  "role": "user",\n  "content": "Can you review this function for me?\n    Focus especially on the auth logic."\n}',
              },
            },
          ],
          [
            {
              id: "ast-desc",
              type: "text",
              props: { content: "The model's previous replies. After each call,\nyour app appends it as an assistant message\nso the model has continuity on the next turn." },
            },
            {
              id: "ast-code",
              type: "code-display",
              props: {
                language: "json",
                content: '{\n  "role": "assistant",\n  "content": "The function looks correct but has\n    a subtle race condition on line 14."\n}',
              },
            },
          ],
          [
            {
              id: "tool-desc",
              type: "text",
              props: { content: "Results from tool/function calls. When the model invokes\na tool, your app runs it and appends the result.\nThe model sees it as a fact it retrieved." },
            },
            {
              id: "tool-code",
              type: "code-display",
              props: {
                language: "json",
                content: '{\n  "role": "tool",\n  "tool_use_id": "toolu_01XCm4",\n  "content": "{\\"linesChanged\\": 42, \\"testsAdded\\": 3, \\"coverage\\": \\"87%\\"}"\n}',
              },
            },
          ],
        ],
      },
    },
  ],
};

const tokenGrowth: ComponentDef = {
  name: "Token Budget Simulator",
  description: "Add message types to watch the token budget fill up. Start: system prompt already loaded.",
  state: [
    { id: "tokens", type: "number", initialValue: 400, min: 0, max: 200000 },
    { id: "log", type: "log", initialValue: [] },
  ],
  actions: [
    {
      id: "addUser",
      ops: [
        { type: "increment", target: "tokens", delta: 80 },
        { type: "clamp", target: "tokens", min: 0, max: 200000 },
        { type: "append-log", target: "log", template: "User message  (+80 tokens)", kind: "allowed" },
      ],
    },
    {
      id: "addAssistant",
      ops: [
        { type: "increment", target: "tokens", delta: 250 },
        { type: "clamp", target: "tokens", min: 0, max: 200000 },
        { type: "append-log", target: "log", template: "Assistant response  (+250 tokens)", kind: "allowed" },
      ],
    },
    {
      id: "addTool",
      ops: [
        { type: "increment", target: "tokens", delta: 150 },
        { type: "clamp", target: "tokens", min: 0, max: 200000 },
        { type: "append-log", target: "log", template: "Tool call + result  (+150 tokens)", kind: "info" },
      ],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "tokens", value: 400 },
        { type: "set", target: "log", value: [] },
      ],
    },
  ],
  blocks: [
    {
      id: "bar-wrap",
      type: "column",
      props: {},
      children: [
        {
          id: "bar",
          type: "progress-bar",
          props: { value: "${tokens}", max: 8000, label: "${tokens} / 8,000 tokens", variant: "used" },
        },
      ],
    },
    {
      id: "controls",
      type: "row",
      props: {},
      children: [
        { id: "btn-user", type: "button", props: { label: "+ User message", action: "addUser" } },
        { id: "btn-ast", type: "button", props: { label: "+ Assistant reply", action: "addAssistant" } },
        { id: "btn-tool", type: "button", props: { label: "+ Tool call", action: "addTool" } },
        { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
      ],
    },
    { id: "log-block", type: "event-log", props: { source: "log" } },
  ],
};

const agentMemory: ComponentDef = {
  name: "Agent Memory Demo",
  description: "Shows how an LLM context window grows with each conversation turn: left panel = chat UI, right panel = full JSON sent to the API each call.",
  state: [
    { id: "input", type: "string", initialValue: "" },
    { id: "messages", type: "log", initialValue: [] },
    { id: "contextRequests", type: "array", initialValue: [] },
    { id: "contextRequests", type: "array", initialValue: [] },
    { id: "step", type: "number", initialValue: 0 },
    { id: "typing", type: "boolean", initialValue: false },
  ],
  actions: [
    {
      id: "send",
      ops: [
        { type: "append-log", target: "messages", template: "", kind: "user", fromState: "input" },
        { type: "clear-string", target: "input" },
        { type: "set", target: "typing", value: true },
        {
          type: "delay-then",
          delayMs: 1500,
          ops: [
            { type: "set", target: "typing", value: false },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 0 },
              then: [{ type: "append-log", target: "messages", template: "Hi! I'm a simple assistant. I can see our entire conversation history above — that's what gets sent to the API on each call.", kind: "assistant" }],
              else: [],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 1 },
              then: [{ type: "append-log", target: "messages", template: "Notice the context window panel on the right? It shows the full JSON array sent to the model. Every message — including this one — is included.", kind: "assistant" }],
              else: [],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 2 },
              then: [{ type: "append-log", target: "messages", template: "As the conversation grows, so does the context. This is why long conversations get expensive and eventually hit token limits.", kind: "assistant" }],
              else: [],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "gte", right: 3 },
              then: [{ type: "append-log", target: "messages", template: "You can keep going — each turn appends to the context. Hit Reset to start fresh.", kind: "assistant" }],
              else: [],
            },
            { type: "increment", target: "step", delta: 1 },
          ],
        },
      ],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "messages", value: [] },
        { type: "set", target: "contextRequests", value: [] },
        { type: "set", target: "contextRequests", value: [] },
        { type: "set", target: "input", value: "" },
        { type: "set", target: "step", value: 0 },
        { type: "set", target: "typing", value: false },
      ],
    },
  ],
  blocks: [
    {
      id: "main-split",
      type: "split",
      props: {},
      children: [
        {
          id: "left-col",
          type: "column",
          props: { minWidth: 0 },
          children: [
            { id: "chat", type: "chat-feed", props: { source: "messages", showTimestamps: false } },
            { id: "typing-ind", type: "typing-indicator", props: { visibleWhen: "typing" } },
            { id: "input-row", type: "chat-input", props: { inputState: "input", sendAction: "send", placeholder: "Type a message…" } },
          ],
        },
        {
          id: "right-panel",
          type: "panel",
          props: { title: "Context Window (sent each call)", collapsible: true, fillHeight: true },
          children: [
            { id: "ctx-display", type: "request-log", props: { source: "contextRequests" } },
          ],
        },
      ],
    },
    {
      id: "footer-row",
      type: "row",
      props: {},
      children: [
        { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
      ],
    },
  ],
};

const agentMemoryV2: ComponentDef = {
  name: "Agent Memory Demo",
  description: "Shows how an LLM context window grows with each conversation turn, including a tool-call turn.",
  state: [
    { id: "input", type: "string", initialValue: "" },
    { id: "messages", type: "log", initialValue: [] },
    { id: "step", type: "number", initialValue: 0 },
    { id: "typing", type: "boolean", initialValue: false },
    { id: "toolPending", type: "boolean", initialValue: false },
    { id: "scenarioStep", type: "number", initialValue: 0 },
    { id: "scenarioChar", type: "number", initialValue: 0 },
    { id: "autoPlay", type: "boolean", initialValue: false },
    { id: "scenarioRunning", type: "boolean", initialValue: false },
    { id: "scenarioStarted", type: "boolean", initialValue: false },
    { id: "scenarioAwaitingSend", type: "boolean", initialValue: false },
  ],
  actions: [
    {
      id: "send",
      ops: [],
    },
    {
      id: "autoPlay",
      ops: [],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "messages", value: [] },
        { type: "set", target: "input", value: "" },
        { type: "set", target: "step", value: 0 },
        { type: "set", target: "typing", value: false },
        { type: "set", target: "toolPending", value: false },
        { type: "set", target: "scenarioStep", value: 0 },
        { type: "set", target: "scenarioChar", value: 0 },
        { type: "set", target: "autoPlay", value: false },
        { type: "set", target: "scenarioRunning", value: false },
        { type: "set", target: "scenarioStarted", value: false },
        { type: "set", target: "scenarioAwaitingSend", value: false },
      ],
    },
  ],
  scenario: {
    inputStateId: "input",
    userTypingMs: 90,
    autoPlayDelayMs: 850,
    assistantTypingMs: 900,
    assistantDelayMs: 350,
    toolDelayMs: 500,
    steps: [
      {
        type: "system",
        text: "You are a senior Go engineer inside a large monorepo. Use terse, practical responses. Prefer concurrency-safe patterns.",
      },
      { type: "pause", ms: 350 },
      {
        type: "user",
        text: "We are leaking goroutines in the request pipeline of a Go API. Where should I look first?",
      },
      { type: "pause", ms: 450 },
      {
        type: "assistant",
        text: "Start with context cancellation and channel drains. I'll scan for goroutine spawns tied to request scope.",
        delayMs: 220,
      },
      { type: "pause", ms: 500 },
      {
        type: "tool",
        text: "{\"mcp\":\"GitHub\",\"action\":\"search\",\"query\":\"go routine leak context.WithCancel\"}",
        delayMs: 380,
      },
      { type: "pause", ms: 500 },
      {
        type: "assistant",
        text: "Safe cancellation pattern:\n\n```go\nctx, cancel := context.WithCancel(r.Context())\ndefer cancel()\n\ngo func() {\n    for {\n        select {\n        case <-ctx.Done():\n            return\n        case msg := <-ch:\n            handle(msg)\n        }\n    }\n}()\n```",
        delayMs: 260,
      },
      { type: "pause", ms: 450 },
      {
        type: "assistant",
        text: "Also check buffered channels that never close; add counters for goroutines per request.",
        delayMs: 220,
      },
      { type: "pause", ms: 600 },
      {
        type: "user",
        text: "Can you show a safe worker pool pattern for this?",
      },
      { type: "pause", ms: 450 },
      {
        type: "assistant",
        text: "Worker pool sketch:\n\n```go\ntype Job struct { ID string }\n\nfunc startPool(ctx context.Context, jobs <-chan Job, n int) *sync.WaitGroup {\n    var wg sync.WaitGroup\n    wg.Add(n)\n    for i := 0; i < n; i++ {\n        go func() {\n            defer wg.Done()\n            for {\n                select {\n                case <-ctx.Done():\n                    return\n                case job, ok := <-jobs:\n                    if !ok {\n                        return\n                    }\n                    process(job)\n                }\n            }\n        }()\n    }\n    return &wg\n}\n```",
        delayMs: 240,
      },
      { type: "pause", ms: 450 },
      {
        type: "assistant",
        text: "Confirm with pprof: capture before and after a load test and watch goroutine count return to baseline.",
        delayMs: 200,
      },
    ],
  },
  blocks: [
    {
      id: "main-split",
      type: "split",
      props: {},
      children: [
        {
          id: "left-col",
          type: "column",
          props: { minWidth: 0 },
          children: [
            { id: "chat", type: "chat-feed", props: { source: "messages", showTimestamps: false } },
            { id: "typing-ind", type: "typing-indicator", props: { visibleWhen: "typing" } },
            {
              id: "input-row",
              type: "chat-input",
              props: {
                inputState: "input",
                sendAction: "send",
                placeholder: "Type a message…",
                autoSendOnInput: true,
                disabledWhen: "scenarioRunning",
              },
            },
          ],
        },
        {
          id: "right-panel",
          type: "panel",
          props: { title: "Context window (sent each call)", collapsible: true },
          children: [
            { id: "ctx-display", type: "request-log", props: { source: "contextRequests" } },
          ],
        },
      ],
    },
    {
      id: "footer-row",
      type: "row",
      props: {},
      children: [
        { id: "btn-autoplay", type: "button", props: { label: "Auto-play", action: "autoPlay", disabledWhen: "scenarioRunning" } },
        { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
      ],
    },
  ],
};

const tokenGrowthV2: ComponentDef = {
  name: "Token Budget Simulator",
  description: "Add message types to watch the token budget fill up. The cost curve updates live as you press buttons.",
  state: [
    { id: "tokens", type: "number", initialValue: 400, min: 0, max: 200000 },
    { id: "log", type: "log", initialValue: [] },
    { id: "callHistory", type: "array", initialValue: [] },
  ],
  actions: [
    {
      id: "addUser",
      ops: [
        { type: "increment", target: "tokens", delta: 80 },
        { type: "clamp", target: "tokens", min: 0, max: 200000 },
        { type: "push-state", target: "callHistory", source: "tokens" },
        { type: "append-log", target: "log", template: "User message  (+80 tokens)", kind: "allowed" },
      ],
    },
    {
      id: "addAssistant",
      ops: [
        { type: "increment", target: "tokens", delta: 250 },
        { type: "clamp", target: "tokens", min: 0, max: 200000 },
        { type: "push-state", target: "callHistory", source: "tokens" },
        { type: "append-log", target: "log", template: "Assistant response  (+250 tokens)", kind: "allowed" },
      ],
    },
    {
      id: "addTool",
      ops: [
        { type: "increment", target: "tokens", delta: 150 },
        { type: "clamp", target: "tokens", min: 0, max: 200000 },
        { type: "push-state", target: "callHistory", source: "tokens" },
        { type: "append-log", target: "log", template: "Tool call + result  (+150 tokens)", kind: "info" },
      ],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "tokens", value: 400 },
        { type: "set", target: "log", value: [] },
        { type: "set", target: "callHistory", value: [] },
      ],
    },
  ],
  blocks: [
    {
      id: "main-split",
      type: "split",
      props: {},
      children: [
        {
          id: "left-col",
          type: "column",
          props: {},
          children: [
            {
              id: "bar",
              type: "progress-bar",
              props: { value: "${tokens}", max: 8000, label: "${tokens} / 8,000 tokens", variant: "used" },
            },
            {
              id: "controls",
              type: "row",
              props: {},
              children: [
                { id: "btn-user", type: "button", props: { label: "+ User message", action: "addUser" } },
                { id: "btn-ast", type: "button", props: { label: "+ Assistant reply", action: "addAssistant" } },
                { id: "btn-tool", type: "button", props: { label: "+ Tool call", action: "addTool" } },
                { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset" } },
              ],
            },
            { id: "log-block", type: "event-log", props: { source: "log" } },
          ],
        },
        {
          id: "right-panel",
          type: "panel",
          props: { title: "Cost Curve", collapsible: false },
          children: [
            { id: "chart", type: "line-chart", props: { source: "callHistory" } },
          ],
        },
      ],
    },
  ],
};

const tokenGrowthV3: ComponentDef = tokenGrowthV2;

const contextDemoV1: ComponentDef = {
  name: "Context Demo",
  description: "Chat interface merged with token tracking: type a message to see the context window JSON and token cost chart update in real time.",
  state: [
    { id: "input", type: "string", initialValue: "" },
    { id: "messages", type: "log", initialValue: [] },
    { id: "step", type: "number", initialValue: 0 },
    { id: "typing", type: "boolean", initialValue: false },
    { id: "toolPending", type: "boolean", initialValue: false },
    { id: "tokenCount", type: "number", initialValue: 400 },
    { id: "totalSpent", type: "number", initialValue: 400 },
    { id: "callHistory", type: "array", initialValue: [] },
    { id: "scenarioStep", type: "number", initialValue: 0 },
    { id: "scenarioChar", type: "number", initialValue: 0 },
    { id: "autoPlay", type: "boolean", initialValue: false },
    { id: "scenarioRunning", type: "boolean", initialValue: false },
    { id: "scenarioStarted", type: "boolean", initialValue: false },
    { id: "scenarioAwaitingSend", type: "boolean", initialValue: false },
  ],
  actions: [
    {
      id: "send",
      ops: [],
    },
    {
      id: "autoPlay",
      ops: [],
    },
    {
      id: "reset",
      ops: [
        { type: "set", target: "messages", value: [] },
        { type: "set", target: "input", value: "" },
        { type: "set", target: "step", value: 0 },
        { type: "set", target: "typing", value: false },
        { type: "set", target: "toolPending", value: false },
        { type: "set", target: "tokenCount", value: 400 },
        { type: "set", target: "totalSpent", value: 400 },
        { type: "set", target: "callHistory", value: [] },
        { type: "set", target: "scenarioStep", value: 0 },
        { type: "set", target: "scenarioChar", value: 0 },
        { type: "set", target: "autoPlay", value: false },
        { type: "set", target: "scenarioRunning", value: false },
        { type: "set", target: "scenarioStarted", value: false },
        { type: "set", target: "scenarioAwaitingSend", value: false },
      ],
    },
  ],
  scenario: {
    inputStateId: "input",
    userTypingMs: 100,
    autoPlayDelayMs: 900,
    assistantTypingMs: 950,
    assistantDelayMs: 450,
    toolDelayMs: 520,
    tokenStateId: "tokenCount",
    tokenHistoryId: "callHistory",
    totalSpentId: "totalSpent",
    steps: [
      {
        type: "system",
        text: "You are a staff Go engineer working in a real codebase. Be precise. Prefer incremental changes and cite tools when used.",
        tokenDelta: 260,
      },
      { type: "pause", ms: 350 },
      {
        type: "user",
        text: "Add a new Go endpoint that exposes build stats and cache hits. Assume this codebase has MCPs.",
        tokenDelta: 170,
      },
      { type: "pause", ms: 500 },
      {
        type: "assistant",
        text: "I'll inspect the service layout, schema, and existing build metrics. Running MCPs.",
        delayMs: 220,
        tokenDelta: 280,
      },
      { type: "pause", ms: 600 },
      {
        type: "tool",
        text: "{\"mcp\":\"Outcoms OS\",\"action\":\"describe_runtime\",\"scope\":\"observability\"}",
        delayMs: 420,
        tokenDelta: 220,
      },
      { type: "pause", ms: 350 },
      {
        type: "tool",
        text: "{\"mcp\":\"GitHub\",\"action\":\"search\",\"query\":\"build stats handler go http\"}",
        delayMs: 420,
        tokenDelta: 220,
      },
      { type: "pause", ms: 350 },
      {
        type: "tool",
        text: "{\"mcp\":\"Postgres\",\"action\":\"describe\",\"table\":\"build_metrics\"}",
        delayMs: 420,
        tokenDelta: 220,
      },
      { type: "pause", ms: 350 },
      {
        type: "tool",
        text: "{\"mcp\":\"Linear\",\"action\":\"search\",\"query\":\"build stats endpoint\"}",
        delayMs: 420,
        tokenDelta: 210,
      },
      { type: "pause", ms: 350 },
      {
        type: "tool",
        text: "{\"mcp\":\"Slack\",\"action\":\"channel_lookup\",\"channel\":\"#platform-build\"}",
        delayMs: 420,
        tokenDelta: 200,
      },
      { type: "pause", ms: 350 },
      {
        type: "tool",
        text: "{\"mcp\":\"WebSearch\",\"action\":\"query\",\"query\":\"go http handler metrics endpoint patterns\"}",
        delayMs: 420,
        tokenDelta: 230,
      },
      { type: "pause", ms: 500 },
      {
        type: "assistant",
        text: "We'll add /v1/build-stats. Use BuildMetricsRepo and return cache hits from build_metrics. I'll sketch the handler and route.",
        delayMs: 260,
        tokenDelta: 320,
      },
      { type: "pause", ms: 500 },
      {
        type: "assistant",
        text: "Handler sketch:\n\n```go\nfunc (h *Handler) buildStats(w http.ResponseWriter, r *http.Request) {\n    stats, err := h.BuildMetricsRepo.Latest(r.Context())\n    if err != nil {\n        http.Error(w, err.Error(), 500)\n        return\n    }\n    render.JSON(w, map[string]any{\n        \"cache_hits\": stats.CacheHits,\n        \"builds\": stats.Builds,\n    })\n}\n```",
        delayMs: 300,
        tokenDelta: 420,
      },
      { type: "pause", ms: 600 },
      {
        type: "user",
        text: "How should we test this and expose metrics?",
        tokenDelta: 140,
      },
      { type: "pause", ms: 500 },
      {
        type: "assistant",
        text: "Testing + metrics:\n\n```go\nfunc TestBuildStats(t *testing.T) {\n    rr := httptest.NewRecorder()\n    req := httptest.NewRequest(http.MethodGet, \"/v1/build-stats\", nil)\n    h.buildStats(rr, req)\n    require.Equal(t, http.StatusOK, rr.Code)\n}\n\nvar buildStatsHits = promauto.NewCounter(prometheus.CounterOpts{Name: \"build_stats_hits_total\"})\n```",
        delayMs: 260,
        tokenDelta: 360,
      },
      { type: "pause", ms: 500 },
      {
        type: "assistant",
        text: "Finally, wire GET /v1/build-stats in the router and add the response shape to the API docs.",
        delayMs: 220,
        tokenDelta: 180,
      },
    ],
  },
  blocks: [
    {
      id: "main-split",
      type: "split",
      props: {},
      children: [
        {
          id: "left-col",
          type: "column",
          props: { minWidth: 0 },
          children: [
            { id: "chat", type: "chat-feed", props: { source: "messages", showTimestamps: false } },
            { id: "typing-ind", type: "typing-indicator", props: { visibleWhen: "typing" } },
            {
              id: "input-row",
              type: "chat-input",
              props: {
                inputState: "input",
                sendAction: "send",
                placeholder: "Type a message…",
                autoSendOnInput: true,
                disabledWhen: "scenarioRunning",
              },
            },
          ],
        },
        {
          id: "right-col",
          type: "column",
          props: { minWidth: 0 },
          children: [
            {
              id: "ctx-panel",
              type: "panel",
              props: { title: "Context window (sent each call)", collapsible: true, fillHeight: true },
              children: [
                { id: "ctx-display", type: "request-log", props: { source: "contextRequests" } },
              ],
            },
            {
              id: "token-panel",
              type: "panel",
              props: { title: "Token usage", collapsible: false },
              children: [
                { id: "token-bar", type: "progress-bar", props: { value: "${totalSpent}", max: 35000, label: "${totalSpent} tokens billed total", variant: "used" } },
                { id: "token-chart", type: "line-chart", props: { source: "callHistory" } },
              ],
            },
            {
              id: "footer-row",
              type: "row",
              props: {},
              children: [
                { id: "btn-autoplay", type: "button", props: { label: "Auto-play", action: "autoPlay", variant: "ghost", disabledWhen: "scenarioRunning" } },
                { id: "btn-reset", type: "button", props: { label: "Reset", action: "reset", variant: "ghost" } },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export async function seedComponents(options: { force?: boolean } = {}): Promise<void> {
  const writeComponent = options.force ? upsertComponent : createComponent;
  await writeComponent({
    id: "token-bucket",
    name: tokenBucket.name,
    description: tokenBucket.description ?? "",
    definition: JSON.stringify(tokenBucket),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "fixed-window",
    name: fixedWindow.name,
    description: fixedWindow.description ?? "",
    definition: JSON.stringify(fixedWindow),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "sliding-window",
    name: slidingWindow.name,
    description: slidingWindow.description ?? "",
    definition: JSON.stringify(slidingWindow),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "agent-memory",
    name: agentMemory.name,
    description: agentMemory.description ?? "",
    definition: JSON.stringify(agentMemory),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "message-roles",
    name: messageRoles.name,
    description: messageRoles.description ?? "",
    definition: JSON.stringify(messageRoles),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "token-growth",
    name: tokenGrowth.name,
    description: tokenGrowth.description ?? "",
    definition: JSON.stringify(tokenGrowth),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "token-growth-v2",
    name: tokenGrowthV2.name,
    description: tokenGrowthV2.description ?? "",
    definition: JSON.stringify(tokenGrowthV2),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "token-growth-v3",
    name: tokenGrowthV3.name,
    description: tokenGrowthV3.description ?? "",
    definition: JSON.stringify(tokenGrowthV3),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "agent-memory-v2",
    name: agentMemoryV2.name,
    description: agentMemoryV2.description ?? "",
    definition: JSON.stringify(agentMemoryV2),
    author: "system",
    status: "approved",
  });
  await writeComponent({
    id: "context-demo-v1",
    name: contextDemoV1.name,
    description: contextDemoV1.description ?? "",
    definition: JSON.stringify(contextDemoV1),
    author: "system",
    status: "approved",
  });
}
