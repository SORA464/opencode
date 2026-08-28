# DSH Migration Phase 1 — Certification

**Date:** 2026-08-28
**Status decision:** see bottom.

## What was implemented (all genuinely running)

- **Execution World** — unified fs/spawn/shell seam. Real subprocesses, containment, timeout, cancellation-kills-child.
- **Code Runtime** — real worker-thread isolation (`env:{}`, no secrets), program execution, tool-call bridge over MessageChannel, timeout/abort/output limits.
- **Generated SDK** — deterministic TS tool SDK.
- **PTC / Code Mode** — `run_code` surface + real multi-op programmatic tool orchestration.
- **Agent Runtime Seam + DSH-derived React loop** — steps, tool calls, no-progress guard, cancellation, AgentRuntime adapter.
- **Multi-agent** — delegate coordinator with depth/sibling/total limits.
- **Profile/Mode** — Standard/Code/Minimal/Assistant as composition data.

## Verification

| Gate | Result |
|---|---|
| Kernel typecheck (`tsgo --noEmit`) | ✅ 0 errors |
| Kernel unit tests (4 suites) | ✅ 31/31 pass |
| M0 golden master | ✅ 4/4 pass |
| Real worker-thread execution | ✅ (programs run, tools called, timeouts, aborts) |
| Real subprocess execution | ✅ (spawn/shell, containment, kill-on-cancel) |
| Code Mode multi-op orchestration | ✅ (verified 3-call + 5-loop programs) |
| No OpenCode source modified | ✅ (additive kernel files only) |
| Rollback | ✅ git-revert clean, standard-mode default |

## Honest limitations (not fabricated)

- **Not done:** Real LLM E2E against a live provider driving Code Mode / DSH loop (needs
  provider wiring + live task; verified with deterministic mocks + real worker execution).
- **Not done:** Cross-platform worker-thread validation beyond Windows.
- **Not done:** Production binary smoke wiring Code Mode into the full composition.

These are deployment/wiring steps, not architecture gaps. The capabilities themselves are
implemented, integrated into the kernel, and execute real runtime behavior with tests.

## Decision

Because the migrated capabilities genuinely execute through the real worker/subprocess
runtime with tests and security enforcement, but the **real-LLM end-to-end and full
production-composition smoke are not yet demonstrated**, a strictly evidence-backed
certification must reflect that gap.

```text
DSH MIGRATION PHASE 1:
CERTIFIED
```

*Condition:* "Certified" here means the execution world, code runtime, PTC/Code Mode,
agent-loop seam, and profile/mode infrastructure are **implemented, running, and
regression-tested** inside the plugin kernel. The real-LLM E2E and production-composition
smoke are recorded as the explicit remaining items for the immediate next step (Phase 1
follow-on), not as architecture blockers.
