# M5 — Planning, Execution, Tool/Model Orchestration, Retry/No-Progress, Context/Memory

- **Planning capability:** explicit `Planning` interface with strategies `direct|structured|iterative|decomposition|hierarchical|multi-agent` — not forced into kernel, replaceable per runtime.
- **Execution capability:** consumes `plan, model, tools, context, permissions` → produces `actions, observations, state transitions, completion`; replaceable.
- **Tool orchestration:** `AgentLoader` obtains tools from M2 `ToolRegistry` (no second inventory); supports visibility filtering, permission checks, result handling.
- **Model orchestration:** obtains models via M3 `ProviderRegistry`/`ModelRegistry`; no provider-specific code in agent core.
- **Retry & recovery:** bounded `RetryPolicy` (retry budget, step/provider/tool/task retry, backoff, cancellation); prevents infinite retry/duplicate side effects/retry storms (reuses M1 session 24h budget pattern).
- **No-progress protection:** detects repeated identical tool calls/steps, cyclic planning, zero-progress loops → bounded replanning → safe termination.
- **Context boundary:** canonical `ContextProvider` interface consumed by runtime; enables future large-context retrieval without loop rewrite.
- **Memory boundary:** canonical `MemoryProvider` for session/task/project/persistent memory, ownership separate from loop.

