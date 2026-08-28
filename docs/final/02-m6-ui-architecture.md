# M6 — UI/UX Pluginization (Implementation)

**Status:** COMPLETE — UI is now plugin-composable via kernel registries.

## Web UI

- **Registry:** `packages/kernel/src/ui/ui-registry.ts` — authoritative `UIRegistry` with `register`/`list`/`remove` for `routes, views, panels, sidebars, settings, commands, dashboards, inspectors`.
- **Manifest:** `ui-manifest.ts` — `UIManifest {id, version, contributions[]}` with validation.
- **Lifecycle:** Contributions are versioned, permission-aware, provenance-tracked.
- **No duplicate routing:** `app/src/app.tsx` hard-coded routes remain as fallback; new `ui.routes` contributions are additive and will become authoritative in M6 follow-on (flag-gated).
- **Command palette:** `ui.commands` contributions via registry; existing `command.register` remains via compatibility.

## Desktop

- Consumes same `UIRegistry` contracts; `desktop` provides `platform` context over shared runtime capabilities.
- No duplication of business/tool/provider/agent logic — desktop is pure surface.

## TUI

- Preserved mature slot architecture (`tui/src/plugin/slots.tsx`); unified semantics with kernel `UIRegistry` where practical (slot names map to `ui-registry` capabilities).

## UI Commands & Settings

- **Commands:** `UIRegistry` capability `commands` with identity, metadata, permissions, shortcuts, lifecycle, provenance, conflicts via `DependencyGraph`.
- **Settings:** Plugin-contributed settings via `ui.settings` with schema, defaults, validation, permissions, provenance, scope.

## Verification

- `bun --cwd packages/kernel typecheck` 0 errors (kernel UI registry)
- `harness/m0/golden-master.test.ts` 4/4 (no src moves outside kernel)
- Manual: TUI slot plugin loads, web UI route contributions list correctly.

