# 07 — UI/UX Plugin Architecture

## 1. Audit result — what UI exists today

| Surface | Composition | Existing extensibility |
|---|---|---|
| TUI (`packages/tui`, OpenTUI/Solid) | routes (home, session, plugin routes w/ missing-fallback), ~25 dialogs, command palette | **mature slot-plugin runtime**: named host slots (`app`, `home_prompt(+_right)`, `sidebar_*`, `session_prompt*`, …), plugin route registry, keymap layers, plugin manager/installer, kv/state/theme/event APIs, 9 builtin feature-plugins |
| Web/Desktop renderer (`packages/app` on SolidJS; desktop = Electron shell + same app) | router (`/`, `/server/:k/session/:id`, legacy dir routes), dual layouts (legacy/new flag), titlebar/tabs, sidebar shell, session timeline + composer docks (permission/question/todo/revert/followup), review/diff panels v2, terminal panels v1/v2, file browser, settings-v2 dialog (general/providers/models/servers), ~15 dialogs incl. command palette (registry in context/command.ts), contexts (server/sdk/sync/models/permission/mcp/tabs/platform/settings/i18n) | command palette registry; theme system (JSON themes + schema); desktop contributes a *platform* context implementation — no general slot/route registry yet |
| Shared (`packages/ui`, `session-ui`) | design system, themes/i18n catalogs, conversation primitives (message parts, streaming markdown, diffs, basic-tool renderers) | basic-tool renderer keyed by tool name — an implicit per-tool UI seam |
| Desktop shell (`packages/desktop/src/main`) | windows/menu/IPC, sidecar server spawn (v1/v2 switch), WSL subsystem, auto-updater, onboarding, deep links, attachment authorization | platform bridge surface (typed ElectronAPI preload) |

## 2. Classification

- **Core UI (kernel-adjacent, stays)**: app shell/router skeleton, SDK/sync contexts, permission &
  question surfaces (SEP rendering), theme engine, i18n engine, accessibility scaffolding.
- **Plugin UI (everything contributed)**: every view/panel/dialog listed above except the SEP-critical
  ones becomes either a *first-party bundle contribution* or third-party contribution through the
  registries below. Concretely pluginizable: session views & timeline parts, composer docks,
  review/diff panel variants, terminal panels, file browser, settings pages (per-domain),
  dashboards/monitoring, inspector views (trajectory-style), sidebar widgets, home/project pickers,
  model/provider/MCP dialogs, onboarding flows, marketing-grade welcome content.

## 3. Target architecture — one registry, three renderers

### 3.1 UI Contribution Registry (kernel-owned, renderer-agnostic)
```ts
ui.slots.register({ id: "session.sidebar", placement: "above:files" })
ui.routes.register({ path: "/acme/dashboard", title: "Acme" })
ui.views.register({ kind: "tool.renderer", tool: "my-tool", component })   // generalizes basic-tool seam
ui.dialogs.register({ id: "acme.connect" })
ui.settings.register({ section: "providers.acme", schema })
ui.commands.register(...)   // palette entries (already exists in app context/command.ts)
```
Slots are named, ordered anchors published by shells; contributions declare relative placement.
Renderer-agnostic descriptors + SolidJS components for in-process trust tiers.

### 3.2 Renderer bindings
- TUI: keep existing slot runtime; expose it as the first consumer of the kernel registry
  (its slots map 1:1). Plugin-manager UX already exists — promote to kernel plugin manager.
- App/desktop: introduce the same slot outlets into layout-new composition points
  (sidebar regions, session docks, settings sections, top-level routes via lazy page loading).
  Command palette already registry-driven — adopt kernel commands as its source.
- Desktop: remains a *platform plugin* implementing the platform bridge (pickers, updater, WSL,
  window mgmt). New hosts (remote web, editor panels) mount `AppInterface` with their own platform
  impl — pattern already proven.

### 3.3 Data access rule
UI never touches server internals: all data via sdk/client (existing AGENTS.md rule) plus the live
event stream. A trajectory-style inspector is therefore just another consumer of durable events —
dsh's "render from session/event" lesson, which our EventV2+SSE already supports.

## 4. Migration mapping (current → plugin state)

| Today | Intermediate | Plugin state |
|---|---|---|
| TUI builtin feature-plugins | move registrations to kernel UI registry (TUI binding keeps slots) | third-party parity |
| TUI plugin routes/manager | unchanged | promoted as THE plugin manager |
| app command palette local registry | source switches to kernel commands | same |
| settings-v2 static sections | section registry (schema-described) | bundles contribute sections |
| review/terminal/file panels hard-imported | lazy-view map keyed by id | contributable views; core keeps defaults |
| basic-tool renderer keyed by name | formalized as `views.tool.<name>` registry entry | MCP/plugin tools ship renderers |
| desktop main-process features | platform bundle behind stable bridge API | alternate hosts possible |

## 5. Non-goals / guardrails
- No remote-code UI in T0/T1 tiers without user consent; T2 UI arrives via declarative descriptors
  rendered by host components only (no arbitrary code in renderer for community tier initially).
- SEP-critical surfaces (permission prompts, approval diffs) are core-rendered; plugins may style,
  not bypass.
- Performance budget per slot (07 perf analysis in 10): slot resolution must stay O(1) lookups +
  pre-sorted insertion; no layout-affecting global recomputes on registration storms.
