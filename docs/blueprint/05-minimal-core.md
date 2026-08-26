# 05 — The Minimal Core (boundary specification)

Principle: the core owns **lifecycle, truth, and enforcement** — nothing else. Everything that merely
*supplies a capability* is a bundled plugin, however first-party.

## 1. Kernel inventory (stays in core, non-plugin)

| # | Component | Contents | dsh analog |
|---|---|---|---|
| K1 | **Runtime substrate** | Effect runtime + LayerNode/app-node graph builder, memo map, keyed mutex (`core/effect/*`) — formalized as the DI kernel | Cordis context/fiber |
| K2 | **Plugin registry & lifecycle manager** | manifest parse → resolve → PENDING→LOADING→ACTIVE→DEGRADED→UNLOADING→DISPOSED/FAILED states; dependency injection via declared keys; scoped effect disposal; reload/disable/upgrade | Cordis lifecycle |
| K3 | **Service registry** | typed service slots (string keys + Effect-Tag identity), lookup/inject API, ownership metadata | `ctx.<key>` |
| K4 | **Event bus** | durable EventV2 (+versioned projectors) AND live bus; domain taxonomy; waterfall runner with mandatory-continuation contract | three event domains |
| K5 | **Composition loader** | profile/bundle/patch resolution: default embedded profile → user profile dir → config-dir `.opencode` → CLI overlays; field-scoped merge with conflict report (improving on dsh whole-row replace) | profiles/bundles/patches |
| K6 | **Configuration layer** | Flag/env sweep, layered config merge, plugin config schemas validation | settings |
| K7 | **Security enforcement point (SEP)** | permission evaluation, approval flow dispatch, protected-path checks, credential vault access mediation. Registered *rules* are pluggable; the *enforcement call-sites are kernel-resident* and cannot be unmounted by composition | sandbox/approval policy (hardened) |
| K8 | **Compatibility layer** | v1 API surface, legacy event adapters, V1 schema subtree, deprecation shims | (dsh n/a) |
| K9 | **Platform substrate** | global paths, credential store, installation/version, process platform splits (`#db/#pty/#fff` conditions) | harness home |

Explicitly NOT kernel even though "core-feeling": session semantics, tool execution pipeline,
provider adapters, LSP/MCP, TUI/web UI, share/sync/cloud. These are bundles.

## 2. Package topology (target)

```
packages/
  schema/        contracts (unchanged role; plugins extend via declaration merging)
  kernel/        K1–K7, K9 (new home for today's core/effect + event + lifecycle + SEP)
  compat/        K8 (v1 api/schema/event adapters), grows smaller each phase
  bundles/
    base-tools/  bash read write edit apply_patch glob grep question skill todo webfetch websearch
    providers-*  per-provider (or grouped) adapter plugins over llm seam
    agent-loop/  default loop implementation behind agents.factory
    mcp/ lsp/ acp/ snapshot-worktree/ share/ skills/ commands/ background-jobs/
    ui-tui/ ui-web/ ui-desktop-platform/
  server/        generic HTTP assembly (thin; mounts protocol + compat bundle)
  opencode/      product shell: CLI verbs + default-profile assembly (shrinks toward pure shell)
```

## 3. Boundary rules (testable)

R1. Kernel imports only: schema, kernel-internal. Never bundles.
R2. Bundles import kernel + schema; never each other's internals — only published service keys/events.
R3. Frontends import sdk/client only (already enforced by AGENTS.md rule).
R4. All capability supply goes through registration APIs; direct static wiring exists solely inside
    the *default profile's own bundle set* (first-party plugins are plugins too).
R5. SEP call-sites are grep-auditable: tools/session/fs must obtain approvals via kernel API;
    a CI check forbids importing permission internals outside kernel.
R6. Every bundle declares `inject` deps; kernel refuses partial graphs with actionable diagnostics
    instead of half-booting.

## 4. Security posture changes

- Policy rules pluggable ⇒ attack surface shifts to composition integrity. Mitigations specified in
  kernel design (06 §6): signed first-party bundles, trust tiers (builtin > verified > community >
  inline), immutable minimum-policy floor compiled into SEP ("deny-by-default external exec" cannot
  be patched away by a user patch), composition diff shown at startup when policy-affecting rows change.
- This is where we deliberately diverge from dsh: their approval policy is an ordinary plugin.

## 5. Size accounting

Today `packages/core` ≈ kernel(K1,K4-part,K9) + many would-be services. Target moves ~70% of core's
non-kernel surface into bundles; `packages/opencode` loses its parallel server/tool/provider trees
(they become bundles), keeping CLI verbs + profile assembly. Net LOC in kernel target: ≲15k
(effect substrate + event + lifecycle + loader + SEP), from ~40k+ spread across core+opencode today.
