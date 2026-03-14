# Future post ideas

## LLM / agents

**Prompt caching in depth**
How prefix caching works on Anthropic and OpenAI. Write/read cost mechanics. When caching breaks (any mutation to the prefix invalidates it). How to measure cache hit rates in production. The gotcha: caching is per-model, per-provider — a cache hit on Sonnet doesn't help you on Opus.

**Stateful vs stateless LLM APIs**
OpenAI Responses API vs Anthropic Messages. What you trade away with stateful: ability to inspect, redact, or inject into the history the model sees. What you gain: simpler application code. When stateful is the wrong default for agents — specifically, any agent that needs to reason about its own history.

**Context compaction**
How server-side compaction differs from manual summarise-and-inject. What you lose (ability to inspect the compressed window, control over what gets preserved). When to use it vs rolling your own. The open question: how do you test that the compaction preserved what you needed?

**Tool use at scale**
Message count explosion in multi-step agents. Strategies: pruning tool results after they've been acted on, structured extraction to reduce result size, batching tool calls. A worked example counting messages in a 10-step agent loop with 3 tool calls per step.

**Long-context economics**
The per-provider surcharge cliffs (~32k on Anthropic, varies elsewhere). When a smaller context + retrieval is cheaper than large context. How to measure token budgets in production — not just per-call but cumulative across a session. The case where 1M context is actually cheaper than RAG (low latency, high precision requirements).

**MCP: the wire format**
What Model Context Protocol actually standardises. How to write an MCP-compatible tool server in Go. Multi-provider agent portability in practice — what you still have to abstract over even with MCP. Current state of provider adoption.

**RAG fundamentals**
Embedding, chunking, retrieval — the decisions that actually matter. Why naive top-k cosine similarity fails on long documents. Hybrid sparse+dense search (BM25 + vector). The latency and cost tradeoff vs just throwing everything into a long context. When each approach wins.

## Systems / Go

**Building a rate limiter in Go**
Token bucket vs sliding window. The sync.Mutex vs atomic tradeoffs. Distributed rate limiting with Redis. Testing time-dependent code without sleeping in tests.

**Structured concurrency patterns in Go**
errgroup, context cancellation, and why context.WithTimeout is usually what you want. The pitfalls of fire-and-forget goroutines. A pattern for bounded parallelism that doesn't require a semaphore.
