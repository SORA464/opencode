# 12 — Event, Service-Registry & Dependency Architecture

> Detailed companion to the kernel design (06). This document specifies the three registries
> the kernel owns and the contracts between them.

## 1. Event architecture

### 1.1 Three domains (normative)

| Domain | Examples | Delivery | Persistence | Extensibility |
|---|---|---|---|---|
| Durable | `turn/*`, `step/*`, `user/message`, `assistant/*`, `tool/*`, future `goal/*`, `memory/*` | SSE broadcast of `session/event`; derived `deriveMessages()` | SQLite EventV2, versioned payloads | declaration-merged `SessionEventMap` variants |
| Live | `agent/status`, `agent/inbox/*`, `agent/pre-step`, `agent/request`, `agent/request-error`, `agent/turn-stopping` | per-agent inbox/status listeners; waterfalls for intercept | volatile (process-local) | `AgentEvent` map |
| Seam/policy | `tools/pre-execute`, `tools/execute`, `tools/post-execute`, `prompt/system`, `fs/policy`, `permission/evaluate`, `telemetry/*` | waterfall/serial/parallel | volatile | capability seams declare their own event keys |

### 1.2 Waterfall contract (hardened vs dsh footgun)

Every waterfall carries an explicit result type:

```ts
type WaterfallResult<T> = { kind: "continue" }
                       | { kind: "replace"; value: T }
                       | { kind: "veto"; reason: string }
```

- Listener **must** call or return a result; kernel warns + treats omission as `continue` for one
  release window, then upgrades to `veto-with-log` (migration aid, then strict).
- Lint rule `no-forgotten-waterfall-next` (ported from dsh guidance) runs in CI.
- A durable event is never produced *inside* a waterfall — only after it completes; violation
  throws in debug builds (preserves "model-visible ⇒ logged" invariant).

### 1.3 Versioning (prerequisite unblocked)

Before any plugin-era payload change: every durable event type carries an explicit schema version in
the projector registry. Historical payloads are handled by versioned codecs. Contract test:
round-trip fixtures per type/version must pass or kernel refuses to boot.

## 2. Service registry

### 2.1 Slot model

- Key: `string` literal union (e.g. `"tools" | "llm.adapter" | "fs" | "pty" | "sandbox" | "jobs"`) +
  `Service.Tag` identity for Effect-typed lookups.
- Slot holds **one active provider** + version. Competing providers for the same slot are a boot error
  unless one declares `replaces: "<previous-id>"` (ordered override, used to swap providers in a profile).
- Lookup is `O(1)` map access. Provider swap = atomic update + dependent reload cascade.

### 2.2 Scoping

| Scope | Example | Lifetime |
|---|---|---|
| Process | `llm` catalog, observability | process |
| Location (per-workspace) | `tools` (Location-scoped service), filesystem Location overlay | per-workspace directory |
| Agent | per-agent tool set, scoped context sources | per-agent (tied to agent) |
| Transient | per-turn prompt sections | per-turn |

The scoped-registration primitive (`scope` package) underlies Location and agent scoping; the kernel
generalizes it rather than reimplementing.

## 3. Dependency model

- **Declared**: `inject: ["tools","llm.adapter"]` on plugin; `inject?:` for optional deps surfaced as
  `Option`. Bundles declare `engines.opencode-kernel` version ranges.
- **Built**: kernel topologically sorts `inject` edges; cycle → boot error naming the cycle.
- **Run**: ready-set is recomputed after every transition; activatable plugins start concurrently within
  tiers — order-independence validated by a test harness that randomizes ready-set drain order.
- **Reverse edges**: a provider disappearing cascades `UNLOADING` through dependents (dsh semantics),
  but behind the quiesce barrier (06 §3) so in-flight tool calls drain/abort before dependents suspend.
- **Self-healing**: failed plugin retries with the kernel retry-budget pattern (hardened in reliability
  work); reload storms rate-limited.

## 4. How a capability addition flows (example)

Adding a fictional `transcribe` tool that needs an audio-backend seam:

1. **Definition** lives in a seam-definition plugin: declares service key `audio` + tool kind `transcribe`.
2. **Providers**: one bundle provides `audio` (e.g. `audio-local-whisper`), another provides the model-
   facing tool `transcribe` that consumes `ctx.services.use("audio")`.
3. **Consumer** is the tool registry: loop dispatches through `ctx.tools` without knowing the backend.
4. **Policy** attaches via `tools/pre-execute` to enforce consent/file-type checks — no loop edit.

Same shape for a non-tool seam: an audio filesystem or a model provider is one provider swap away.

## 5. Tests that lock this doc

- Contract suite per seam: provider interface conformance (mock consumer exercises every method).
- Dependency-order fuzzer: randomized activation order must converge to same ACTIVE set or error.
- Waterfall fuzz: listener that throws / forgets continuation / replaces vs vetoes — kernel behavior
  snapshot-tested.
- Event version fixture suite per durable type/version.

