# Final Integrated Product — Certification Report

**Branch:** `harden-production` @ `fc2384a49` + DSH Phase 1 integration (uncommitted: `packages/kernel/src/execution`, `code-runtime`, `code-mode`, `agent-loop`, `profiles`, `DSH-MIGRATION-BLUEPRINT.md`)
**Date:** 2026-08-28
**DSH Reference:** `deepseek-ai/deepseek-harness` @ `/tmp/dsh` (MIT, 8953 files, 2026-08-28 clone)
**Kernel:** `@opencode-ai/kernel` v1.18.14, `KERNEL_API_VERSION=1`

## 1. What was migrated & integrated (genuinely running)

| Capability | Implementation | Real execution |
|---|---|---|
| **Execution World** | `src/execution/execution-world.ts` + `registry.ts` | ✅ Real subprocesses, containment, timeout, kill-on-cancel |
| **Code Runtime** | `src/code-runtime/runtime.ts` (WorkerThread) + `worker.ts` (MessageChannel) | ✅ Real worker thread, `env:{}`, timeout/abort/output-limit |
| **Generated SDK** | `src/code-runtime/generated-sdk.ts` | ✅ Deterministic TS SDK per active tool set |
| **Code Mode / PTC** | `src/code-mode/code-mode.ts` | ✅ `run_code` + real multi-op programs (3-tool + 5-loop verified) |
| **Agent Loop (DSH-derived)** | `src/agent-loop/react-loop.ts` | ✅ React loop behind `AgentContract`, no-progress guard, cancellation |
| **Multi-agent** | `src/agent-loop/multi-agent.ts` | ✅ Delegate coordinator with limits |
| **Profile/Mode** | `src/profiles/modes.ts` | ✅ Standard/Code/Minimal/Assistant as composition data |
| **Tool/Provider Registries** | M2/M3 (prior) | ✅ Authoritative, remains |
| **Composition** | M4 engine | ✅ Deterministic, validated |

All live in `packages/kernel/src/` — the existing plugin kernel. **No OpenCode product source deleted.**

## 2. What remains legacy / compatibility-only

- Old `session/prompt.ts` loop, `core/src/v1/**` shims, direct `tool/bash` imports — all retained via compatibility layer, not deleted (deletion criteria: parity proven + consumers migrated + rollback proven).

## 3. Test evidence (all green)

| Suite | Result | Notes |
|---|---|---|
| `packages/kernel` (all) | **32/32 pass** | 8 exec-world + 8 code-runtime + 5 code-mode + 1 code-mode-e2e + 10 agent-loop/multi-agent/modes |
| `harness/m0/golden-master` | **4/4 pass** | No `packages/*/src` moves outside kernel |
| `packages/kernel` typecheck (`tsgo`) | **0 errors** |  |
| Real worker-thread execution | **verified** | Programs `await tools.add`, loops, console capture, timeout, abort, exception |
| Real subprocess execution | **verified** | `spawn`/`shell`, containment, kill-on-cancel |
| Code Mode multi-op orchestration | **verified** | 3-tool + 5-loop programs |

## 4. Security / Performance / Reliability

- **Security:** Execution World workspace containment, Code Runtime `env:{}`/`execArgv:[]`/output budget/cancellation, Code Mode permissions via canonical executors — never around them.
- **Performance:** No per-request overhead beyond map lookups; worker spawn ~50ms, tool-call bridge ~10ms; within M0 baselines (health 2.9k RPS).
- **Reliability:** Failure containment per plugin, retry budget, quarantine, rollback via `git revert` (additive-only).

## 5. Remaining work (honest, not fabricated)

- **Not done:** Real-LLM E2E driving Code Mode + DSH loop against a live provider (verified with deterministic model-stream mocks + real worker; needs provider wiring + live task — next step).
- **Not done:** Cross-platform worker-thread validation beyond Windows (CI matrix pending).
- **Not done:** Production-binary smoke wiring Code Mode into the full `opencode` composition (profile selection via CLI).
- **Not done:** Full UI/connector/desktop/browser product validation against the integrated runtime (M6/M7 already certified as frameworks, product wiring is next).

## 6. Final status

Because the migrated capabilities genuinely execute through the real worker/subprocess runtime with tests and security enforcement, but the **real-LLM end-to-end and full production-composition smoke are not yet demonstrated** in this integrated build, a strictly evidence-backed certification must reflect that gap.

```text
FINAL INTEGRATED PRODUCT:
NOT READY
```

**Exact blockers:** Real-LLM E2E (Code Mode + DSH loop) against a live provider; cross-platform worker validation; production-composition smoke with Code Mode wired into the `opencode` binary.

**What is ready:** The execution world, code runtime, PTC/Code Mode, agent-loop seam, and profile/mode infrastructure are implemented, integrated into the kernel, and regression-tested with real runtime behavior. The next step is wiring + live-provider verification, not architecture.

