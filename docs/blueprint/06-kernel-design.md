# 06 — Plugin Kernel Design

## 1. Plugin identity & manifest

- Identity: npm-style `name@version` + content hash of contribution set.
- Manifest: `opencode` field in package.json (04 §2). Kinds: `plugin` (code entry),
  `bundle` (ordered list of plugin refs + patch rows), `profile` (deployment composition).
- Forms accepted for code entries (dsh-proven ergonomics): function `apply(ctx)`, object
  `{ name, inject, apply, cleanup? }`, class extending `KernelService`.

## 2. Boot sequence (deterministic, observable)

```
0. parse CLI/config → effective profile request
1. load SEP floor policy (compiled-in, immutable)          // before any user composition
2. resolve composition: default embedded bundles → profile bundles → .opencode dir → patches/overlays
   - per-row provenance recorded; conflicts reported (field-scoped merge)
3. build dependency graph from `inject` + contributes; detect cycles (error) / orphans (warn)
4. construct kernel services (K1–K7,K9)                    // never plugins
5. schedule plugin fibers: all PENDING; kernel repeatedly activates every plugin whose inject-set is ACTIVE
   (concurrent within readiness tiers — order-independence like Cordis)
6. each activation: run apply(ctx) inside plugin scope;
   registrations (services/events/tools/UI/effects) recorded as reversible effects
7. post-boot: emit `kernel/ready`; print composition report (provenance, policy diffs vs floor)
8. serve surface(s) per active profile's runtime bundle (headless/web/tui/acp)
Failure at any step: fail-closed with the exact unresolved-dependency/parse report; no half-graph serving.
```

## 3. Lifecycle states & transitions

```
PENDING ──deps satisfied──> LOADING(apply) ──ok──> ACTIVE ──disable/unload──> UNLOADING ──> DISPOSED
   │                            │                                              ^
   │                            └─ throw ──> FAILED (isolated; siblings unaffected)  │
   └─ dep lost (runtime) <───────────── reverse-dependency cascade ───────────────┘
dep returns ⇒ PENDING again (auto-reload), preserving last intent (enabled/disabled persisted).
```

- **Isolation tiers**: T0 builtin in-process (trusted, same-realm); T1 verified-community in-process
  with capability-scoped ctx façade; T2 community out-of-process (worker/message-port transport over
  schema-serialized calls) — substrate reuses `codemode` confinement ideas and dsh's
  isolation-as-diagnostic lesson ("isolation label is not a security claim"; T2 is the actual boundary).
- Upgrade = unload(old)+load(new) under a quiesce barrier: in-flight tool calls drain or abort per
  registered cancellation contract; session log untouched (plugins never own durability).

## 4. Dependency model

- Declarative `inject: string[]` on service keys; optional deps via `inject?:` (kernel surfaces
  absence explicitly, no hidden nulls); version ranges on bundle refs.
- Reverse-edge cascades on unavailability (dsh behavior) but with **quiesce-first**: dependents get
  `beforeSuspend()` to flush, matching our background-job eviction semantics.
- Cycle detection at graph build; self-healing reload loops rate-limited (reuse hardened retry-budget
  pattern from session/retry).

## 5. Communication

| Need | Mechanism |
|---|---|
| direct capability call | service slot lookup (`ctx.services.use("tools")`) |
| observe | domain event subscription (auto-disposed) |
| intercept/policy | waterfall w/ explicit `{ continue, replace, veto }` result |
| durable fact | append typed event to EventV2 (declaration-merged event maps) |
| cross-process (T2) | schema-serialized RPC bridge; no shared references |

## 6. Failure containment & recovery

- Listener exceptions contained per-subscriber (pattern already shipped in ACP diagnostics fix);
  waterfalls treat throw as veto-with-log, never as silent pass-through.
- FAILED plugin: quarantined; dependents receive `service.unavailable` typed errors; UI/plugin-manager
  surfaces reason + restart action; auto-restart with backoff capped by kernel budget.
- Crash recovery: kernel state is derived from disk manifests each boot (no hidden plugin state);
  durable facts live in EventV2 ⇒ restart replays, exactly today's server semantics.
- Watchdog: boot must complete within budget (measured baseline: current cold start numbers in 11);
  hung `apply` fails the plugin, not the product.

## 7. Permissions (kernel-enforced)

- Plugins declare *requested* capabilities in manifest (`"permissions": ["fs.workspace", "net", "exec", "ui.dialog"]`).
- SEP grants/denies per trust tier + user approval flow (existing permission UX reused).
- Runtime mediation: every capability registry consults SEP at registration AND execution
  (registration-time filtering already exists in v2 ToolRegistry — generalized).
- Kernel APIs are the only route to privileged operations; CI grep-audit enforces boundary (05 R5).

## 8. Long-term evolution levers

- Declaration-merged registries for every extensible union (tool kinds, event kinds, UI nodes,
  auth flows) — new variants ship without core releases.
- Contract tests generated from manifests (schema-conformance suite per bundle).
- Versioned kernel API (`kernel.apiVersion`) with N-1 compatibility window handled by compat layer.
