# M3.9–3.12 — Streaming, Tool-Call, Reasoning, Structured-Output Contracts

> Implementations: `streaming-contract.ts`, `tool-call-contract.ts`, `reasoning-contract.ts`, `structured-output-contract.ts`

- **Streaming:** `StreamEvent` union (token/toolCall/done/error) with `[Symbol.asyncIterator]`; preserves ordering, partials, completion signals, error propagation; incomplete stream never becomes success.
- **Tool-call:** canonical `ToolCall {id,name,args}` with `normalize` from provider-specific formats; multiple/parallel calls, ordering preserved.
- **Reasoning:** `Reasoning {content?, hidden?, tokens?}` with `redactIfNeeded` respecting product policy.
- **Structured output:** `validate(schema, value)` via Effect Schema; malformed never treated as valid.

All adapters normalize provider-specific formats before core sees them.

