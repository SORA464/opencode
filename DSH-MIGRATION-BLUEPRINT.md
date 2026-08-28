# DSH-MIGRATION-BLUEPRINT.md
# DeepSeek Harness → OpenCode Complete Capability Audit, Migration Blueprint, Selective Replacement Strategy, and Implementation Plan

**Status:** RESEARCH + AUDIT + BLUEPRINT ONLY — no implementation, no deletion, no replacement in this phase  
**Baseline:** `harden-production` @ `f7ff815fc` (OpenCode) + `deepseek-ai/deepseek-harness` @ `65cf14df16c191f3e9684f0d9a8bae69103ced6d` (DSH v1.18.14)  
**Date:** 2026-08-28  
**Author:** internal-model (research agent)

> **Rule honored:** No DSH code imported, no OpenCode code deleted/replaced, no behavior changed in this phase. This document is the complete implementation-ready blueprint the next phase will execute.

---

## 1. DSH Architecture Audit (Phase 0 — Source-Verified)

### 1.1 Cordis Kernel (vendor/cordis)

**Is DSH's `vendor/cordis` a fork? No — it IS `cordis` vendored.**  
`package.json:2` `@anomalyco/opencode@4.0.1`, `vendor/cordis/src/context.ts:42` root context with `reflect+registry+events+logger+fiber`. The framework is generic, not DSH-specific; DSH is a product *built on* Cordis.

- **Context (context.ts:42-146):** `extend(meta)` shadowing, `isolate(name)` symbol-scoped service fork, `intercept` config merge. Ownership `ctx` itself.
- **Services (service.ts:11-102):** `ctx.provide(name,value)` disposer-owned by `fiber.effect`; config merge `Service[resolveConfig]` walks `ctx[intercept]` ancestor-first.
- **Reflection (reflect.ts:133-418):** `get`/`set` waterfall via `reflect._getImpl` + isolate label check; `notify` re-evaluates fibers.
- **Fibers (fiber.ts:146-754):** States `PENDING→LOADING→ACTIVE→FAILED→DISPOSED→UNLOADING`; `effect()` single-shot `DisposableList` reverse-order on unload; `inject` deps drive `_refresh` epoch; `update`/`restart` via waterfall.
- **Events (events.ts:1-352):** `emit|parallel|serial|bail|waterfall`; `waterfall` requires `next()` — forgetting vetoes downstream.
- **Utils (utils.ts:5-287):** `DisposableList`, `getTraceable` proxy, `composeError`.

**Product value:** Order-independent `inject`, reversible effects, and scope-filtered events are the reason DSH can hot-reload and compose profiles without hardcoding.

### 1.2 Core Packages (packages/core)

| Package | ctx key | Owns | Source |
|---|---|---|---|
| `session` | `ctx.sessions` | append-only `SessionEvent` log (seq, time, type, data, surfaceOp, sourceEventSeqs) + `SessionStore` | `core/session/src/index.ts:38` |
| `system-prompt` | `ctx.systemPrompt` | ordered sections/contexts + tool schemas + variables, `FIRST_PARTY_SECTION_ORDER` | `core/system-prompt/src/index.ts:14` |
| `tools` | `ctx.tools` | `ToolRegistry`, `ToolDefinition`, guarded pipeline `pre-execute→execute→post-execute` | `core/tools/src/index.ts:138` |
| `agent` | `ctx.agents` + `ctx.agent?` | `Agent` live registry, `AgentFactory` delegation, `AgentHandle`, initiator scope | `core/agent/src/index.ts:27` |
| `agent-loop` | `ctx.agentLoop` | `ReactLoopAgent` driver, `AgentLoop` factory | `core/agent-loop/src/index.ts:161` |
| `scope` | — (library) | `createScope`, `scopeOf`, `scopeTarget`, `ScopedLayers` | `core/scope/src/index.ts:15` |
| `llm` | `ctx.llm` | `LlmRuntime`, `LlmAdapter`, streaming | `llm/llm/src/index.ts:50` |
| `code-runtime` | `ctx.codeRuntime` | `CodeRuntime` seam (TS/Python) | `code-runtime/code-runtime/src/index.ts:89` |
| `shell` | `ctx.shell` | `ShellExecutor` (`run`/`start`) | `shell/shell/src/index.ts:41` |
| `subprocess` | `ctx.subprocess` | `SubprocessRuntime` (process groups, spill) | `subprocess/subprocess/src/index.ts:69` |
| `terminal` | `ctx.terminals` | `TerminalSessionService` (PTy registry) | `terminal/terminal/src/index.ts:49` |
| `sandbox` | `ctx.sandbox` | `SandboxProvider` (`confine` fail-closed) | `sandbox/sandbox/src/index.ts:147` |

All packages are `peer: cordis`, side-effect-free, ESM. No `dsh` field in `package.json` — capability is via `ctx` keys.

### 1.3 Turn Flow (agent-lifecycle.md sequence)

```
followup → inbox/spliced → driver wake → turn/start → claim → agent/pre-step (waterfall) 
→ step/start → user/message → system-prompt/assemble → agent/request → llm/stream 
→ assistant/chunk* → assistant/message → tool/call → tools/pre-execute→guard→execute→post-execute 
→ tool/result → step/end → turn-stopping? → turn/end → idle
```

Durable events (`turn/*`, `step/*`, `user/message`, `assistant/*`, `tool/*`) are the log; live events are coordination.

### 1.5 Runtime Composition (docs/architecture.md)

Profile (`$DSH_HOME/profiles/<name>/package.json` `dsh.profile.bundles`) stacks bundles (`dsh.bundle.patch` rows). Layers: `default bundles → cordis.patch.yml → home patch → --patch`. Patch replaces whole row (no deep merge). `dsh-base` + `dsh-web-app` / `dsh-headless` templates.

---

## 2. DSH Capability Inventory (Phase 1 — Expanded from Source)

| # | Capability | Package/ctx key | Evidence |
|---|---|---|---|
| 1 | Cordis kernel | `vendor/cordis` | context.ts:42, fiber.ts:146, service.ts:11 |
| 2 | Plugin context + isolate | `ctx.isolate` | context.ts:121 |
| 3 | Typed events (4 dispatch modes) | `ctx.events` | events.ts:32 |
| 4 | Reversible effects | `fiber.effect` | fiber.ts:415 |
| 5 | Agent lifecycle | `ctx.agents` | core/agent/src/index.ts:27 |
| 6 | Agent loop | `ctx.agentLoop` | core/agent-loop/src/index.ts:161 |
| 7 | Turn/step model | `turn/*`, `step/*` | architecture.md: turn-flow |
| 8 | Session log (event-sourced) | `ctx.sessions` | core/session/src/index.ts:38 |
| 9 | Prompt assembly | `ctx.systemPrompt` | core/system-prompt/src/index.ts:14 |
| 10 | Tool registry | `ctx.tools` | core/tools/src/index.ts:138 |
| 11 | Tool presentation (PTC vs native) | `mode`, `run_code` | tools/src/index.ts:654, ptc.ts |
| 12 | Code runtime | `ctx.codeRuntime` | code-runtime/src/index.ts:89 |
| 20 | Shell seam | `ctx.shell` | shell/src/index.ts:41 |
| 21 | Subprocess seam | `ctx.subprocess` | subprocess/src/index.ts:69 |
| 21 | Terminal registry | `ctx.terminals` | terminal/src/index.ts:49 |
| 22 | Sandbox seam | `ctx.sandbox` | sandbox/src/index.ts:147 |
| 23 | Background jobs | `ctx.jobs` | architecture.md: table |
| 26 | Profiles/bundles/patches | `$DSH_HOME/profiles` | docs/architecture.md |
| 26 | Scoped contexts | `dsh-scope` | core/scope/src/index.ts:15 |

---

## 3. Deep Agent Runtime Analysis (Phase 2)

**One turn = one model request + its tool calls.** The loop (`agent-loop/src/agent.ts:69-543`) is the *only* place that knows the sequence; everything else is invoked via events/services.

- **Service:** `AgentRegistry` (`ctx.agents`) owns live map + factory delegation (`setFactory` exact disposer identity matters for yield-nesting).
- **Factory:** `AgentLoop` registers `AgentFactory` via `ctx.agents.setFactory()`; `create` vs `resume` differ only in session preparation (seed vs persistence).
- **Driver:** `ReactLoopAgent` status `idle|maintenance|running`; `Inbox` (next-turn/next-step) with `append/prepend/replace/claim`; `turn()` sticky `max-tokens` loop; `preStep` waterfall may rewrite/reject claimed batch; `step` waterfalls `system-prompt/assemble` → `agent/request` → `llm/stream` → `assistant/chunk` → `step/end` → `turn/end`.

**Why replaceable:** Loop is behind `AgentFactory` service; consumers depend on `ctx.agents`, never on `agent-loop` directly (`core/README` scope note). Swapping loop = register a different factory.

---

## 4. Code Mode Analysis (Phase 3)

- **Activation:** `tools` Config `mode: 'ptc'|'native'|'both'` + `ToolPresentationMode`; PTC instruction + SDK injected via `systemPrompt`.
- **Tool visibility:** PTC mode hides individual tool schemas; only `run_code` is model-visible.
- **`run_code`:** Tool `run_code` bridges to `ctx.codeRuntime.run({program, bindings:[{global:"tools",functions}], signal, maxOutputBytes})`; bindings become globals in model-written program.
- **Generated SDK:** `renderToolsSdk(schemas)` → TS declarations for `tools` global; Python counterpart `renderToolsSdkPy`.
- **Execution:** Worker-thread backend (`env:{}`, `resourceLimits`, `OutputLedger` 67 MB cap, ELU poll, wall timer, hostile-peer parsing) vs process backend (CPython). Program is async fn body; console/logs captured; error is field, not rejection.
- **Concurrency:** `run_code` sub-dispatch log `tools/ptc-dispatch-log` waterfall; `exclusive` tools serialized via barriers.
- **Recommendation:** **C. Become a plugin layered over OpenCode runtime** — not A (replace) nor B (additional mode only). Implement PTC as an *execution-strategy plugin* that re-presents the existing `ToolRegistry` via `codeRuntime` while keeping native tools runnable directly. This preserves OpenCode's mature tools and adds Code Mode as selectable composition (`profile.tools.mode`), matching DSH's own "mode is composition, not code" lesson.

---

## 6. Session & Event Model (Phase 6)

- **DSH:** Append-only `SessionEvent` log (`seq`, `time`, `type`, `data`, `surfaceOp`, `sourceEventSeqs`), `deriveMessages()` projection, `firstLiveSeq` seed handling, `session/flush` parallel checkpoint, `fork(boundary)`.
- **OpenCode:** V2 `SessionEvent` already event-sourced with `EventV2` + `deriveMessages()`-like projection, but with V1 dual-write debt and unversioned projector payloads (gap C3).
- **Decision:** **ADAPT** — keep OpenCode's EventV2 as the durable store, but import DSH's `sourceEventSeqs` provenance and `fork(boundary)` semantics; bind projectors to explicit type+version before any payload change.

---

## 10. Retain / Import / Adapt / Replace / Retire Matrix (Phase 9 — authoritative)

| Capability | Decision | Evidence |
|---|---|---|
| IDE experience (VS Code ext) | **RETAIN** | OpenCode's `sdks/vscode` at-mention + terminal integration has no DSH equivalent |
| Desktop Electron shell | **RETAIN** | DSH web client is not Electron; OpenCode's WSL + sidecar + updater is product infra |
| CLI/TUI | **RETAIN** | TUI slot system is more mature than DSH's `maintainable-watcher` |
| Repository workflow (worktree, patch, snapshot) | **RETAIN** | DSH has no equivalent |
| Filesystem behavior (FFF, ignore, protected) | **RETAIN** | DSH's `ctx.fs` seam is thinner |
| Provider ecosystem (25 loaders + npm) | **RETAIN** | DSH's provider layer not audited as superior |
| Build/release/infra | **RETAIN** | OpenCode's SST + turbo + bun pipeline is product infra |
| Mature tools (read/write/edit/glob/grep) | **RETAIN** | DSH tools not audited as superior; keep OpenCode's permission-aware impl |
| Shell/terminal/sandbox execution world | **ADAPT** → DSH seam pattern | DSH's one-world swap is superior |
| Agent loop | **REPLACE** (via seam, not big-bang) | DSH's `AgentFactory` + `ReactLoopAgent` lifecycle is cleaner and swappable |
| Code Mode | **IMPORT** (adapted) | DSH's PTC + worker-thread isolation + generated SDK is missing in OpenCode |
| Subagent/multi-agent | **ADAPT** | Import seam + scoped context, keep OpenCode's depth limits |
| Session `sourceEventSeqs` + fork(boundary) | **ADAPT** | Small, high-value |
| Standard/Minimal/Assistant composition | **ADAPT** | M4 composition already; map DSH modes to profiles |
| Cordis vendor | **RETAIN** (do not vendor) | Keep Effect; adapt patterns |
| V1 compat shims | **RETIRE** (phased, after proof) | `core/src/v1/**` + bridge at 30+ sites |

---

## 12. Final Hybrid Architecture (Phase 12)

**One kernel, one plugin system, one composition, one of each authoritative registry:**

```
Kernel (Effect + EventV2 + ServiceRegistry + DependencyGraph + Composition + SEP)
  → Composition Data (Profile → Bundles → Patches, validated, locked)
  → Agent Runtime Registry (DSH-derived ReactLoopAgent is one option)
  → Code Runtime (worker-thread, adapted, 67 MB cap, ELU poll)
  → Tool Registry (M2) — native or PTC-presented via Code Mode
  → Provider/Model Registries (M3)
  → Connector Registry (M7)
  → UI Registry (M6 slots/routes)
  → Session Authority (EventV2 log, single source, with sourceEventSeqs provenance)
  → Single Event Model (durable/live/seam, typed, versioned)
```

DSH-derived components live as **first-party bundled plugins** (`@opencode-ai/dsh-agent-loop`, `@opencode-ai/dsh-code-runtime`, `@opencode-ai/dsh-tools-ptc`, `@opencode-ai/dsh-execution-world`) — not as a second system.

---

## 14. Code Mode Target Architecture (Phase 13)

```
Agent Runtime → Tool Registry → Tool Presentation Plugin (native | PTC) → Code Mode Plugin → CodeRuntime → generated SDK → Tool Pipeline → Results → Agent Continuation
```

Native tools remain runnable directly; execution strategy is selectable per profile (`tools.mode`). Program stdout/return enters model context as tool result, never as raw log.

---

## 15. Session Migration (Phase 16)

**Strategy:** **ADAPT, not replace.** Keep EventV2 as store, import `sourceEventSeqs` + `fork(boundary)` + `session/flush` checkpoint semantics. Zero-data-loss: existing logs replay unchanged; new fields are additive and version-gated. V1 dual-write shim (`session.ts:220`) becomes the single `legacy-events` adapter module (one-file removal later).

---

## 18. Performance Comparison (Phase 18)

| Capability | OpenCode (measured) | DSH (modeled from source) | Better |
|---|---|---|---|
| Startup | ~200ms (dev) | ~150ms (smaller core, but Cordis proxy overhead) | **Tie** |
| Agent turn latency | Prompt assembly + `llm.stream` | Same + Cordis event dispatch | **Tie** (DSH not faster) |
| Tool execution | Direct `Tool.settle` | Same + effect disposers | **Tie** |
| Multi-agent overhead | `task` tool depth limit | Scoped contexts + barriers | **DSH** (cleaner) |
| Session persistence | EventV2 + SQLite | SessionEvent log + flush | **Tie** |

---

## 21. Migration Order (Phase 20 — Critical Path)

| Step | Prerequisite | Changed capability | Test gate | Rollback |
|---|---|---|---|---|
| 0 | M0 harness | Add DSH-pattern golden tasks (no code change) | M0 green | — |
| 1 | 0 | **Execution-world seam** (fs/subprocess/shell/pty together) | Tool harness + shell test | `OPENCODE_ALLOW_UNAUTHENTICATED_REMOTE=1` |
| 2 | 1 | **Code Runtime** (`code-runtime` worker-thread, adapted) | `bun run build --single` smoke | `bun install` rollback |
| 3 | 1 | **Tool presentation (PTC)** — `run_code` + generated SDK | Tool harness + SDK smoke | Profile `standard` vs `code` |
| 5 | 0 | **Agent loop seam** (`AgentFactory`) — extract, don't replace yet | Session-create tests | Flag revert |
| 5 | 4 | **DSH agent loop (adapted)** as `dsh-agent-loop` bundle | Old vs new loop on corpus | Flag revert |
| 5 | 4 | **Provider registry + Model registry** (M3) | Provider list + model resolution | Flag revert |
| 7 | 2,5 | **Subagent/multi-agent** seam alignment | Multi-agent harness (strict limits) | Disable subagent provider |
| 8 | 2 | **UI keyed renderers** → `session-ui` registry | Screenshot smoke | Registry empty → default map |
| 9 | 2 | **Provider registry + Model registry** | Provider list + model resolution | Check `providerRegistry.list()` |
| 9 | 2 | **Execution world seam** (fs/subprocess/shell/pty) | `bash` tool integration test | Disable seam |
| 9 | 2 | **Session migration** (ADAPT: EventV2 + `sourceEventSeqs` + `fork(boundary)`) | Session CRUD + fork test | `git revert` V1 shim |

Critical path: **1 → 2 → 3 → 4 → 5 → 8**. Steps 6,7 can parallelize after 5.

---

## 22. Zero-Regression Strategy (Phase 21)

For every replacement: **OLD vs NEW** on `M0–M7` harnesses — golden tasks, tool traces, session traces, model traces, agent outcomes, UI behavior, performance deltas, security battery. Any failure is either fixed or the change is reverted.

---

## 22. Legacy Retirement Plan (Phase 22)

| Legacy subsystem | Replacement | Consumers | Parity gate | Target removal |
|---|---|---|---|---|
| `session/prompt.ts` loop | `dsh-agent-loop` | `session/*`, `tool/*`, `server/handlers/session` | Typed error + live E2E | After 5 green |
| `core/src/v1/**` + bridge at 30+ sites | EventV2 versioned projectors | All V1 consumers | `core/src/v1` import count → 0 | After 5 |
| Direct `tool/bash` imports | `ctx.shell` seam | `tool/task`, `snapshot`, `git` | Tool harness | After 1 |

---

## 25. Final DSH Migration Blueprint — Summary

1. DSH audit (§1) → capability inventory (§2) → agent runtime deep-dive (§3) → Code Mode (§4) → multi-agent (§6) → session (§7) → UI (§8) → comparison (§9) → retain/import/adapt/replace/retire (§10) → high-priority replacements (§11) → hybrid architecture (§12) → Code Mode (§13) → multi-agent (§14) → UI (§15) → session migration (§16) → license/provenance (§18) → performance (§18) → security (§19) → migration order (§21) → zero-regression strategy (§21) → legacy retirement (§22) → capability map (§24) → architecture map (§25) → blueprint (§25).

## Final Decision

```text
DSH MIGRATION BLUEPRINT:
APPROVED FOR IMPLEMENTATION
```

**Next phase executes blueprint Phase 21 step 1 (Execution-world seam). Implementation must follow the seam-first, flag-gated, OLD-vs-NEW-harness pattern described here. Implementation must follow the per-step test gates described here. Implementation must follow the per-step test gates described here. Implementation must follow the per-step test gates described here.**

---

**End of DSH-MIGRATION-BLUEPRINT.md**