# Final Gap Inventory — Pre-DSH (M6+M7 Remaining)

> Baseline: M5 `b48039d6b` (agent runtime framework). No DSH code.

## 1. Hardcoded Capability Ownership (remaining)

| Subsystem | Hardcoded? | Evidence | Target |
|---|---|---|---|
| **Web routes** | YES | `app/src/app.tsx:615-644` hard-coded `<Route>` | `ui.routes` contributions |
| **Web settings** | YES | `app/src/context/settings.tsx:183-222` hard-coded schema | `ui.settings` registry |
| **Web commands** | YES (internal) | 12× `command.register("layout")` etc. | `ui.commands` kernel registry |
| **Desktop IPC** | YES | `desktop/src/main/ipc.ts:65-299` 30 literals | `ipcRegistry` |
| **Desktop menu** | YES | `desktop/src/main/menu.ts` | `desktopMenu` contributions |
| **TUI core routes** | YES (hybrid) | `tui/src/app.tsx:1112` hard-coded home/session | Keep core, slots already pluginizable |
| **MCP** | YES | `mcp/index.ts` hardcoded catalog | `connector` + `mcp` seam |
| **Connectors** | NONE | No connector abstraction exists | `ConnectorRegistry` |
| **Extensions** | NONE | No generic plugin discovery/upgrade/rollback | `ExtensionRegistry` |
| **V1/V2 dual** | YES | `core/src/v1/**` + `httpapi/server.ts` dual mount | `compat` bundle |
| **Composition root** | YES | `httpapi/server.ts:212` 55-service LayerNode hardcoded | Composition-as-data (M4 engine) |

## 2. Duplicate Registries/Loaders

- Tool: V1 `opencode/src/tool/registry.ts` + V2 `core/src/tool/registry.ts` → M2 kernel `ToolRegistry` is authoritative; V1 shim remains (intentional until M4 composition drives it)
- Provider: `provider/provider.ts` BUNDLED map (25) + `llm/providers/*` → M3 registries are authoritative; old map in compat
- Loader: `plugin/loader.ts` (npm install) + `ToolLoader` + `ProviderLoader` → to be unified under kernel `PluginLoader` + `ExtensionRegistry`

## 3. Legacy V1/V2, Shims, Debt

- `core/src/v1/**` (19 files) — frozen compat surface per 03-A3
- `opencode/src/server/routes/instance/httpapi/server.ts` dual mount — M4 composition will collapse
- `core/src/tool/bash.ts` 12 TODOs — M2 backlog
- `core/src/event.ts:180` projector version not bound — M0 guardrail debt C3
- `ServerAuth` duplication M1 debt B1 (already fixed via kernel re-export, but file duplication remains)

## 4. Dead/Obsolete Code Candidates

- `opencode/src/temporary.ts` (dead weight, high risk per 03)
- `core/src/public-event-manifest.ts` (zero importers)
- `packages/containers`, `packages/docs` without package.json — infra dirs, keep
- No large dead code beyond above; verified via `git ls-files` + grep zero-importer check (03)

## 5. Missing Tests / Rollback / Observability

- UI plugin slot: no harness for malicious UI (XSS) — to be added in M6 hardening
- Connector: no harness for OAuth abuse, SSRF, cross-user access — to be added M7
- Scale: large composition graphs not yet tested — M4 engine handles 1000 plugins <200ms (modeled), need measured

## 6. Classification

| Subsystem | Verdict |
|---|---|
| Kernel (effect, event, lifecycle) | **CORE** — keep |
| Tool system | **COMPLETE** (M2) — wrappers shipped |
| Provider system | **COMPLETE** (M3 framework) — per-family migration incremental |
| Agent runtime | **COMPLETE** (M5 framework) — per-strategy migration incremental |
| Composition engine | **COMPLETE** (M4 framework) |
| Web UI routes/settings/commands | **MIGRATION REQUIRED** (M6) |
| Desktop IPC/menu | **MIGRATION REQUIRED** (M6) |
| TUI | **COMPLETE** (slot architecture mature) |
| Connectors/MCP | **MIGRATION REQUIRED** (M7) |
| Extension ecosystem | **MIGRATION REQUIRED** (M7) |
| V1/V2 compat | **LEGACY** — frozen, to be `compat` bundle |
| `temporary.ts`, `public-event-manifest.ts` | **DELETE CANDIDATE** (after proof) |

No subsystem is ignored. Every gap has an assigned M6/M7 phase.
