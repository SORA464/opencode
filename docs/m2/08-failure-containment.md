# M2.8 — Failure Containment

> Implementation: `packages/kernel/src/tools/failure-containment.ts`

- **Quarantine:** `quarantine(id, reason, error)` — `load-failure`, `execution-failure`, `validation-failure` — with timestamp.
- **Isolation:** `isQuarantined(id)` check before any tool call; `guard(id, fn)` wraps execution, catches throw, quarantines, and returns typed `{error}` — never crashes runtime.
- **Graceful degradation:** quarantined tool call returns `ToolFailure`-compatible error; dependents see `service.unavailable` typed error (future, via service registry).
- **Recovery:** `release(id)` after fix; auto-retry with backoff via kernel retry-budget pattern (hardened in reliability work).
- **Invariant:** Broken tool plugin must not destabilize runtime — verified by adversarial test: register a tool whose `execute` throws, call it, assert quarantine and that subsequent unrelated tool still succeeds.

Future: per-plugin error containment already shipped in ACP diagnostics fix is the same pattern.

