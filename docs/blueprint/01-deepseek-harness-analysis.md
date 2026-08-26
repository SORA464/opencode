# 01 — DeepSeek Harness Architectural Analysis

Source basis (researched 2026-08-26): `github.com/deepseek-ai/deepseek-harness` (`docs/architecture.md`,
`docs/agent-lifecycle.md`, subsystem references), `deepseek.com/harness/en/`, the Cordis framework
(`cordiverse/cordis`, paper _"A Programming Paradigm for Spatiotemporal Composability"_), and
third-party analyses. DeepSeek Harness (`dsh`) is an MIT-licensed **developer preview**; APIs are
declared unstable by its own release notes.

## 1. The architecture in one paragraph

dsh is a thin orchestration runtime over the **Cordis** kernel. There is no privileged product core:
the model adapter, tool registry, session log, system-prompt assembly, agent loop, sandboxes,
storage, scheduling, and the web UI are all *plugins*. A running system is a **plugin tree composed
at boot from ordered layers** (profile → bundles → user patches → CLI overlays). Plugins contribute
three kinds of things to a shared `ctx` context — **services** (stable string keys, e.g. `ctx.tools`),
**typed events**, and **reversible effects** — and everything registered through `ctx` unwinds
automatically when the plugin unloads.

## 2. Core mechanics (what actually makes it work)

### 2.1 Service registry with declared dependencies
- Services live at stable `ctx.<key>` slots. Consumers declare hard requirements via `inject`.
- Lifecycle: `PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED | FAILED`. A consumer stays
  `PENDING` until every required service exists, is unloaded if a dependency disappears, and
  reloads when it returns. **Consequence: YAML/list order is not a startup contract** — entries
  start concurrently; only `inject` edges control readiness.

### 2.2 Reversible-effect lifecycle
- `ctx.on()`, child plugins, service registrations, and registry entries are all effects.
- External handles (timers, watchers, sockets) must be acquired inside `ctx.effect()` with a disposer.
- Automatic cleanup on unload/HMR is the reason hot-reload and dynamic composition are safe.

### 2.3 Typed event domains (the real extension API)
| Domain | Nature | Persistence |
|---|---|---|
| `session/event` (`turn/*`, `step/*`, `user/message`, `assistant/*`, `tool/*`) | append-only log broadcast | durable |
| `agent/*` (inbox, status, request, pre-step, request-error, turn-stopping) | live coordination on a live Agent | volatile |
| capability domains (`fs/*`, `tools/*`, `telemetry/*`, `llm/stream`) | attach policy/adapters to seams | volatile |

Event delivery contracts differ: `emit` (broadcast), `parallel`, `serial`, and **waterfall**
(interception with mandatory `next()`).

### 2.4 The event-sourced session log
- Append-only `SessionEvent` stream is the **single source of truth**; LLM history is *projected*
  (`deriveMessages()`), never stored separately. Fork/resume/search/replay/transcripts/UI all read
  the same stream.
- Invariant: **"model-visible means logged"** — anything reaching a model request must be
  reconstructable from the log, enforced by a runtime assertion.

### 2.5 Capability seams
A seam = **Service Definition + Provider(s) + Consumer(s)**. Examples: `ctx.llm` (adapter seam),
`ctx.fs`/`ctx.subprocess`/`ctx.shell`/`ctx.terminals` (one shared *execution world* — pointing fs
and subprocess at a remote sandbox moves Bash, PTY and LSP together), `ctx.sandbox`, `ctx.subagents`
(in-process child ↔ out-of-process ACP behind one interface), `ctx.codeRuntime` (worker/process/container),
`ctx.commands`, `ctx.jobs`.

### 2.6 Composition units
- **Profile** (deployment): named composition under `$DSH_HOME/profiles/<name>`, lists ordered bundles,
  holds user patches.
- **Bundle** (distribution): npm package declaring `dsh.bundle.patch` — a list of config rows.
  `dsh-base` ships model adapters, tools, persistence, sandbox/approval policy, settings, credentials,
  telemetry; `dsh-web-app` adds the browser app; `dsh-headless` a runner without server.
- **Patch**: targets a row by id and **replaces its whole config** (no deep merge); overlays stack
  bundle-order → profile patch → home patch → `--patch`.

### 2.7 Extensible sum types via declaration merging
Registries are `<tag, Handler>` maps; unions derive via `keyof`. Plugins add variants (new tool
types, new session-event types, new UI node types) **without editing the owning package**.

## 3. Why it scales / stays maintainable

1. **Order independence** (`inject`) removes the classic init-order bug class across hundreds of plugins.
2. **Reversibility** makes load/unload/reload/HMR safe, which makes experimentation cheap — the actual
   driver of ecosystem growth.
3. **Uniform contract** (one plugin shape, one registration path, one context) collapses the
   Tool/Memory/Router/Chain abstraction zoo; swapping a vector store equals swapping a model provider.
4. **Seams encode product-level swaps**: remote sandbox = one provider swap, not a fork.
5. **Event-sourced log** decouples every observer (UI, telemetry, forks, compaction) from the loop.
6. **Profiles/bundles separate deployment choice from distributable composition**, which is what makes
   a marketplace possible without special-casing.

## 4. Weaknesses, costs, and tradeoffs (evidence-based)

1. **Preview volatility**: official notes say core plugins and APIs will keep changing; manifests need
   pinned schema versions. Any adoption must treat dsh's *patterns*, not its code, as the reference.
2. **Waterfall footgun**: a listener that forgets `next()` silently vetoes downstream behavior —
   powerful and dangerous; needs lint/test guardrails.
3. **Whole-row patch replacement** (no deep merge) is safe for determinism but hostile to users who
   expect merges; every override restates the world.
4. **Shared-context god-object risk**: `ctx` with dozens of keys plus ambient initiator scope can
   degrade into implicit global coupling if key hygiene isn't governed.
5. **Indirection cost**: one more hop per capability; boot-time graph resolution; debugging requires
   plugin-aware tooling (they ship a Creator mode / trajectory view for exactly this).
6. **Security inversion risk**: approval/sandbox policy is itself a plugin — flexibility here means a
   mis-composed profile can *remove* the safety layer. dsh mitigates socially (docs), not structurally.
7. **Ecosystem cold-start**: value scales with third-party plugins; preview-stage ecosystem is small.

## 5. Adopt / adapt / reject ledger

| Mechanism | Decision | Rationale |
|---|---|---|
| inject-style PENDING dependency resolution | **ADOPT** | kills ordering bugs at OpenCode's scale |
| reversible-effect lifecycle + unload semantics | **ADOPT** | prerequisite for hot reload & safe disable |
| three-domain event taxonomy (durable/live/seam) | **ADOPT (maps cleanly onto EventV2 vs live bus)** | matches OpenCode's existing split |
| event-sourced session projection ("model-visible ⇒ logged") | **ADOPT as target-state invariant** | OpenCode's V2 session already trends here |
| capability-seam triad (definition/provider/consumer) | **ADOPT** as the design vocabulary for every extraction |
| execution-world seam (fs+subprocess+shell+pty together) | **ADAPT** — highest-value seam for OpenCode (remote/container agents) |
| profiles/bundles/patch-layering | **ADAPT** — rename, simplify (fewer overlay levels), add deep-merge option per-field opt-in |
| declaration-merging sum-type registries | **ADAPT** — OpenCode uses Effect Schema discriminated unions instead |
| agent-loop as swappable plugin | **ADAPT (phase-late)** — valuable, but stabilize loop contracts first |
| waterfall interception everywhere | **SELECTIVE** — use for request/tool pipelines with mandatory-next lint + explicit veto result type |
| whole-row patch replacement only | **REJECT as sole mode** — support field-scoped merge with conflict detection |
| unguarded security-policy-as-plugin | **REJECT** — policy enforcement point must be kernel-resident, non-unloadable |

## 6. Net assessment

dsh demonstrates that a full everything-is-a-plugin agent platform is viable **when the kernel owns
lifecycle, dependency resolution, and reversibility** and when durability is event-sourced. Its
lessons transfer directly; its implementation should not be copied (different DI substrate, preview
instability, different security posture). OpenCode is unusually well-positioned to adopt the model
because it already possesses Effect-Layer DI, a durable event bus (EventV2), a scoped tool registry
algebra, and a real plugin hook surface — the migration is largely *formalizing existing seams*,
not inventing new ones.
