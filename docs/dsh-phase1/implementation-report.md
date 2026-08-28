# DSH Migration Phase 1 — Implementation Report

## 1. Scope

This phase implements the first DSH-derived runtime capabilities inside the existing
OpenCode plugin kernel, per the approved `DSH-MIGRATION-BLUEPRINT.md`. Implemented in order:

1. **Execution World** (Phase A)
2. **Code Runtime** (Phase B)
3. **Generated SDK** (Phase B)
4. **PTC / Code Mode** (Phase C)
5. **Agent Runtime Seam + DSH-derived Agent Loop** (Phase D/E)
6. **Profile / Mode integration** (Phase F)

All code lives in `packages/kernel/src/` under the existing plugin kernel — no second
plugin architecture, no DSH monolithic dependency. Adapted from DSH source, reimplemented
on our own primitives (clean reimplementation, no direct DSH file copy).

## 2. Files added

| File | Purpose |
|---|---|
| `src/execution/execution-world.ts` | Unified fs/spawn/shell seam with containment, timeout, cancellation |
| `src/execution/registry.ts` | Authoritative Execution World registry |
| `src/execution/index.ts` | Canonical module index (replaces stale M6 scaffold) |
| `src/code-runtime/worker.ts` | Worker-side program executor + tool-call bridge (MessageChannel) |
| `src/code-runtime/runtime.ts` | Worker-thread Code Runtime host executor (timeout/abort/output-limit) |
| `src/code-runtime/generated-sdk.ts` | Deterministic TypeScript tool SDK generator |
| `src/code-mode/code-mode.ts` | Code Mode (PTC): run_code surface + tool binding orchestration |
| `src/agent-loop/react-loop.ts` | DSH-derived React agent loop + AgentRuntime adapter |
| `src/agent-loop/multi-agent.ts` | Sub-agent coordinator with depth/sibling/total limits |
| `src/profiles/modes.ts` | Standard/Code/Minimal/Assistant composition profiles |
| `src/index.ts` | Added exports for all new modules |

## 3. Tests (all green)

| Suite | Tests | Coverage |
|---|---|---|
| `test/execution-world.test.ts` | 8 | read/write/list, traversal rejection (no escape), spawn, non-zero exit, timeout, cancellation kills child, shell |
| `test/code-runtime.test.ts` | 8 | real worker-thread program exec, tool binding, loops, console capture, timeout, cancellation, exceptions, generated SDK |
| `test/code-mode.test.ts` | 5 | SDK surface, multi-tool orchestration in one program, loop/batch, failed-tool error, timeout |
| `test/agent-loop.test.ts` | 10 | single step, tool-and-continue, no-progress guard, cancellation, AgentRuntime adapter, multi-agent delegate + depth limit, all four modes + tool selection |

**Total: 31/31 kernel tests pass.** Golden master 4/4. Kernel typecheck 0 errors.

## 4. Genuine runtime execution (not wrappers)

- **Execution World** `spawn`/`shell` actually launch real subprocesses via
  `node:child_process`, capture stdout/stderr, enforce workspace containment, kill on
  timeout, and terminate children on cancellation. Verified with real `process.execPath`
  runs.
- **Code Runtime** actually spawns a real Node worker thread (`node:worker_threads`) with
  no inherited env, executes the model-written program via `AsyncFunction`, and bridges
  tool calls back to the host over a dedicated `MessageChannel`. Verified: a program
  `await tools.add({a:1,b:2})` returns 3; loops accumulate; `while(true){}` times out;
  abort mid-run returns `abort`.
- **Code Mode** genuinely orchestrates multiple tool calls in one generated program
  (verified: 3 calls in one run, 5-loop batch), reduces model↔tool round-trips, and
  routes every call through canonical executors (permissions), never around them.
- **Agent Loop** actually drives steps and tool calls, with a no-progress guard (3
  repeated identical calls → `no-progress`), cancellation → `aborted`, and an
  `AgentRuntime`-compatible adapter.

## 5. Security

- Execution World enforces workspace containment (lexical `..`/absolute escape rejected).
- Code Runtime runs with `env: {}`, `execArgv: []` (no inherited secrets/loader hooks),
  wall-clock timeout, output budget, cancellation.
- Generated code is untrusted input (AsyncFunction, strict mode).
- Tool bindings route through canonical executors — no bypass of tool permissions.

## 6. DSH Provenance

- Source: `deepseek-ai/deepseek-harness`, cloned to `C:\Users\soop2\AppData\Local\Temp\dsh`
  (revision recorded in repo).
- Adapted concepts (clean reimplementation, no copied files):
  - `packages/code-runtime/code-runtime-worker-thread/src/{protocol,bootstrap}.ts`
    → `packages/kernel/src/code-runtime/{worker,runtime}.ts`
  - `packages/core/agent-loop/src/agent.ts` (ReactLoopAgent)
    → `packages/kernel/src/agent-loop/react-loop.ts`
  - `packages/core/tools/src/ptc.ts` + `ts-types.ts`
    → `packages/kernel/src/code-mode/code-mode.ts` + `generated-sdk.ts`
- License: DSH is MIT. Clean reimplementation in our idioms; no third-party notices
  required for adapted concepts (architecture inspiration + API adaptation).

## 7. Rollback

- All new code is additive (`packages/kernel/src/*`), no OpenCode source modified/deleted.
- Disabling new capabilities = not registering them (composition selects Standard mode).
- `git revert` of this commit removes the entire phase cleanly.

## 8. Not yet done (honest)

- Real LLM E2E driving Code Mode / the DSH loop against a live provider (requires the
  provider/credential path wiring and a live task; deferred — verified with deterministic
  model-stream mocks + real worker execution).
- Cross-platform worker-thread verification beyond Windows (CI matrix pending).
- Production binary smoke with Code Mode wired into the full composition.
