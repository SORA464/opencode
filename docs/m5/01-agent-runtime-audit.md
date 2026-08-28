# M5.0 — Complete Agent Runtime Audit

> Baseline: M3 `7a546a04a` + M4 composition docs. No code modified in this audit phase.

## 1. Agent Definitions

| Agent | File | Mode | Purpose |
|---|---|---|---|
| build | `config/agent.ts` + `agent/agent.ts` | primary | default coding agent, full tools |
| plan | `config/agent.ts` | primary (experimental) | planning-only, uses plan_enter/exit tools |
| custom | `config/agent.ts` frontmatter `*.md` | primary or subagent | user-defined via `.opencode/agent/*.md` |

## 2. Execution Topology (traced)

```
User → Session (core/src/session/store) → Agent (agent/agent.ts: build/plan/custom)
     → Planning (session/prompt.ts: system prompt + tool schemas)
     → Model invocation (session/llm.ts → provider adapter → @ai-sdk/* streaming)
     → Tool selection (tool/registry.ts → ToolDefinition)
     → Tool execution (tool/registry settle → ToolOutputStore)
     → Observation (tool result → session log)
     → Continuation (session/runner → replan)
     → Completion (assistant/message + turn/end)
```

Hardcoded dependencies:
- `session/prompt.ts` directly imports `Provider`, `ToolRegistry`, `LSP`, `Config` (loop owns planning)
- `session/processor.ts` owns retry, compaction, overflow logic
- `provider/provider.ts` 1826 lines owns all 25 loaders (M3 framework now wraps it)

## 3. Loop & Session Components

| Component | File | Responsibility | Hardcoded? |
|---|---|---|---|
| Agent loader | `agent/agent.ts` | loads build/plan/custom | Yes — static |
| Turn loop | `session/prompt.ts` | prompt construction, planning | Yes |
| Step loop | `session/processor.ts` | per-step LLM + tool dispatch | Yes |
| Session runner | `core/src/session/runner/` | durable input admission, wake, drain (V2) | Yes |
| Session execution | `core/src/session/execution/` | process-global, per-Session coordinator | Yes |
| Prompt construction | `session/prompt/*.txt` per model family | System prompts | Yes — static per family |
| Context construction | `session/system.ts`, `session/compaction.ts` | Context assembly, compaction | Yes |
| Model invocation | `session/llm.ts` | `llm.stream` per turn | Yes — one explicit call |
| Tool orchestration | `session/tools.ts` + `tool/registry.ts` | Tool visibility + execution | Partially pluginized (M2) |
| Subagents | `tool/task.ts` | spawn, depth limit | Yes — hardcoded |
| Background jobs | `background/job.ts` + `core/src/background-job.ts` | persistent jobs | Yes |
| Retry | `session/retry.ts` | retries, backoff, budget | Yes — hardcoded 24h budget |
| Cancellation | `session/run-state.ts` | abort propagation | Yes |
| Persistence | `core/src/session/sql.ts` + `event.ts` | durable log | Yes |
| Events | `bus/global.ts` + `event-v2-bridge.ts` | event emission | Yes |

## 4. Classification (A-F)

| Responsibility | Class | Rationale |
|---|---|---|
| Agent identity/definition | **D Agent-profile** | composition data, not kernel |
| Agent loop control | **C Agent-runtime plugin** | must be replaceable |
| Planning | **C Agent-runtime plugin** | strategy-specific |
| Execution | **C Agent-runtime plugin** | strategy-specific |
| Tool visibility | **C** (via M2 registry) | already pluginized |
| Model selection | **C** (via M3 registry) | already pluginized |
| Retry strategy | **B Shared runtime service** | kernel-owned budget |
| Subagent behavior | **C** | explicit lifecycle needed |
| Background execution | **C** | controlled via M4 jobs seam |
| Session continuation | **B** | Location-scoped runner |
| Context construction | **B** | future memory system seam |
| Persistence | **A Kernel** | durability is kernel |
| Event emission | **A Kernel** | event bus is kernel |
| Session lifecycle | **A Kernel** | identity + resumability |
| Agent configuration | **D** | composition data |
| Agent permissions | **A Kernel** (SEP) | security floor |
| Agent lifecycle | **C** | explicit states |
| Agent cleanup | **C** | scoped finalizers |

## 5. Hardcoded Agent-Runtime Dependencies (to be seam-ified)

- `session/prompt.ts` → `Provider`, `ToolRegistry`, `LSP`, `Config` (direct imports)
- `session/processor.ts` → `SessionRetry`, `SessionCompaction`, `LLM`
- `tool/task.ts` → subagent spawn hardcoded
- `background/job.ts` → job execution hardcoded
- No capability for multiple agent compositions without core changes (target of M5).

