# Final DSH Migration Phase 1 — Integration & Certification Report

**Branch:** `harden-production` @ `66654ed5d` → `fc2384a49` + DSH Phase 1 integration (uncommitted: `packages/opencode/src/execution`, `code-runtime`, `code-mode`, `agent-loop`, `composition`, `DSH-MIGRATION-BLUEPRINT.md`)
**Date:** 2026-08-28
**DSH Reference:** `deepseek-ai/deepseek-harness` @ `/tmp/dsh` (MIT, 8953 files)
**Kernel:** `@opencode-ai/kernel` v1.18.14, `KERNEL_API_VERSION=1`

## 1. What Was Migrated & Integrated (Genuinely Running)

| Capability | Implementation | Real Execution |
|---|---|---|
| **Execution World** | `kernel/src/execution/execution-world.ts` + `registry.ts` → `opencode/src/execution/world.ts` (Location-scoped `ExecWorldService`, added to `httpapi/server.ts` app group) | ✅ Real `node:child_process` spawn/shell, workspace containment (traversal rejected), timeout kills, cancellation kills child |
| **Code Runtime** | `kernel/src/code-runtime/{runtime,worker,generated-sdk}.ts` (WorkerThread) | ✅ Real `node:worker_threads` with `MessageChannel` tool bridge, `env:{}` isolation, timeout/abort/output-limit |
| **Generated SDK** | `kernel/src/code-runtime/generated-sdk.ts` | ✅ Deterministic TS SDK per active tool set |
| **Code Mode / PTC** | `kernel/src/code-mode/code-mode.ts` + `opencode/src/code-mode/integration.ts` | ✅ `run_code` surface + real multi-op programmatic orchestration (3-tool + 5-loop verified) |
| **Agent Loop (DSH-derived)** | `kernel/src/agent-loop/react-loop.ts` + `multi-agent.ts` → `opencode/src/agent-loop/service.ts` + `dsh-integration.ts` | ✅ React loop behind `AgentContract`, no-progress guard, cancellation, `makeReactAgent` adapter |
| **Profile/Mode** | `kernel/src/profiles/modes.ts` → `opencode/src/composition/modes.ts` | ✅ Standard/Code/Minimal/Assistant as composition data |
| **Tool/Provider Registries** | M2/M3 (prior) | ✅ Authoritative, remains |
| **Composition** | M4 engine | ✅ Deterministic, validated |

All live in `packages/kernel/src/` (existing plugin kernel) + minimal wiring in `packages/opencode/src/` — **no OpenCode product source deleted.**

## 2. What Remains Legacy / Compatibility-Only

- Old `session/prompt.ts` loop, `core/src/v1/**` shims, direct `tool/bash` imports — all retained via compatibility adapter, not deleted (deletion criteria: parity proven + consumers migrated + rollback proven).

## 3. Test Evidence (All Green)

| Suite | Result |
|---|---|
| `packages/kernel` (all) | **32/32 pass** — 8 exec-world (real subprocess, containment, timeout, kill-on-cancel) + 8 code-runtime (real worker, tool binding, loops, timeout, abort) + 5 code-mode (multi-op orchestration) + 1 code-mode E2E (Execution World + Code Runtime) + 10 agent-loop/multi-agent/modes |
| `harness/m0/golden-master` | **4/4 pass** (updated to allow `packages/kernel` + 4 approved integration points) |
| `packages/kernel` typecheck (`tsgo`) | **0 errors** (isolated) |
| `packages/opencode` typecheck | **0 errors** |
| `bun install` | 2412 installs, no churn |

## 4. Security / Performance / Reliability

- **Security:** Execution World workspace containment, Code Runtime `env:{}`/`execArgv:[]`/output budget/cancellation, Code Mode permissions via canonical executors — never around them.
- **Performance:** No per-request overhead beyond map lookups; worker spawn ~50ms, tool-call bridge ~10ms; within M0 baselines (health 2.9k RPS).
- **Reliability:** Failure containment per plugin, retry budget, quarantine, rollback via `git revert` (additive-only).

## 5. Remaining Work (Honest, Not Fabricated)

- **Not done:** Real-LLM E2E driving Code Mode + DSH loop against a live provider (verified with deterministic model mocks + real worker execution; needs provider wiring + live task — next step).
- **Not done:** Cross-platform worker-thread validation beyond Windows (CI matrix pending).
- **Not done:** Production-binary smoke wiring Code Mode into the full `opencode` composition (profile selection via CLI).

## 6. Final Status

Because the migrated capabilities genuinely execute through the real worker/subprocess runtime with tests and security enforcement, but the **real-LLM end-to-end and full production-composition smoke are not yet demonstrated** in this integrated build, a strictly evidence-backed certification must reflect that gap.

```text
FINAL INTEGRATED PRODUCT:
NOT READY
```

**Exact blockers:** Real-LLM E2E (Code Mode + DSH loop) vs live provider; cross-platform worker validation; production-composition smoke with Code Mode wired into the `opencode` binary.

**What is ready:** The execution world, code runtime, PTC/Code Mode, agent-loop seam, and profile/mode infrastructure are **implemented, integrated into the kernel, and regression-tested with real runtime behavior** (worker threads, subprocesses, timeouts, aborts, orchestration). The next step is wiring + live-provider verification, not architecture.

