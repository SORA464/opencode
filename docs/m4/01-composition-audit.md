# M4.1 — Complete Composition Audit

> Baseline: f7ff815fc + M1 (d6e796b9e) + M2 (d35af32c9) + M3 (7a546a04a). No M4 code modified yet.

## 1. Composition Roots & Entry Points

| Entry Point | File | Description |
|---|---|---|
| **CLI Main** | `packages/opencode/src/index.ts` | yargs CLI with 25 commands; eager imports all commands |
| **Server** | `packages/opencode/src/server/server.ts` | `Server.listen()` → NodeHttpServer + Effect HttpRouter |
| **HTTP API** | `packages/opencode/src/server/routes/instance/httpapi/server.ts` | 310 lines; `createRoutes()` composes 7 route groups into LayerNode |
| **TUI** | `packages/opencode/src/cli/cmd/tui.ts` | Spawns Worker thread; runs `runTui` via `AppNodeBuilder.build(Global.node)` |
| **Desktop Main** | `packages/desktop/src/main/index.ts` | Electron main; spawns sidecar v1 (utilityProcess) + v2 (background CLI) |
| **Desktop Sidecar v1** | `packages/desktop/src/main/sidecar.ts` | `utilityProcess.fork("sidecar.js")` → imports `virtual:opencode-server` |
| **Desktop Sidecar v2** | `packages/desktop/src/main/background-cli.ts` | Stages Bun binary to userData/cli; runs `service start` |
| **Run Command** | `packages/opencode/src/cli/cmd/run.ts` | 1000+ lines; handles 3 modes (run/attach/mini) |

**Hardcoded Composition Points:**
- CLI registers 25 commands eagerly at import time (`src/index.ts:1-31`)
- HTTP API `createRoutes()` statically imports 7 route groups (310 lines)
- Desktop spawns sidecars via hardcoded paths (`virtual:opencode-server`)
- TUI spawns Worker thread with hardcoded `worker.ts` path

## 2. Module Structure & Composition Roots

### 36 top-level modules in `packages/opencode/src/`
| Module | Role |
|---|---|
| `account`, `acp`, `agent`, `auth`, `background`, `bus`, `cli`, `command`, `config`, `control-plane`, `effect`, `env`, `format`, `git`, `id`, `ide`, `image`, `installation`, `lsp`, `mcp`, `patch`, `permission`, `plugin`, `project`, `provider`, `question`, `server`, `session`, `share`, `skill`, `snapshot`, `storage`, `sync`, `tool`, `util`, `worktree` |

**Core (`packages/core/src` — 28 dirs):**
`account`, `config`, `control-plane`, `credential`, `database`, `effect`, `event`, `filesystem`, `flag`, `github-copilot`, `id`, `image`, `installation`, `integration`, `oauth`, `observability`, `permission`, `plugin`, `project`, `pty`, `reference`, `ripgrep`, `session`, `share`, `skill`, `system-context`, `tool`, `util`, `v1`, `workspace`

### Composition Roots Identified:
1. **CLI** (`src/index.ts`) → yargs command registration (25 commands)
2. **Server** (`server.ts` + `httpapi/server.ts`) → 55-service LayerNode group
3. **TUI** (`cli/cmd/tui.ts` + `tui/layer.ts`) → Worker + `Global.node`
4. **Desktop** (main + sidecar v1/v2) → Electron + sidecar processes
5. **Plugin System** (`plugin/index.ts` + `loader.ts`) → Dynamic imports + npm installs
6. **Agent Runtime** (`session/processor.ts` + `session/runner/`) — V2 execution loop
9. **Tool Registry** (`core/src/tool/registry.ts`) — Dual registry (ApplicationTools + Location-scoped)
7. **Provider System** (`provider/provider.ts`) — 25 hardcoded loaders + dynamic `npm` providers
8. **Config System** — Multi-source merge (global, local, remote, well-known, env vars, managed)
9. **Session V2** (`core/src/session/`) — Durable admission + advisory wake, serialized drains
10. **Event System** — EventV2 bus + GlobalBus bridge + EventV2Bridge

## 3. Startup Sequence (Cold CLI)

```
1. yargs parse (src/index.ts:45) → imports all 25 command modules eagerly
2. Command dispatch → effectCmd gate (instance=true for tui/run, false for serve/web)
3. AppRuntime.init → ManagedRuntime.make(AppLayer, memoMap)
   AppLayer = AppNodeBuilderV1.build(LayerNode.group([~50 nodes]))
   Layer.provideMerge(Observability.layer) // MUST be last (#34730)
2. LayerNode.compile() — flatten, cycle-check, memoize
3. Instance bootstrap (per-directory):
   - InstanceBootstrap wraps Config/Plugin/ShareNext/Format/LSP/Vcs/Snapshot
   - ScopedCache per directory; fire-and-forget init()s
4. Command-specific:
   - serve → listenerLayer + startWithPortFallback(4096→0)
   - tui → Worker spawn → runTui via AppNodeBuilder.build(Global.node)
```

**Lazy vs Eager:**
- Eager: 28 CLI commands, Server layer (55 services), Observability, Observability.layer
- Lazy: Server (`await import("../../server/server")`), TUI stack (`runInteractiveMode`), providers (`@ai-sdk/*`), tree-sitter, code-mode, plugin entries, OpenAPI doc response

## 4. Dependency Graph (Package Level)

```
schema (leaf)
  ↑
protocol ──► server
    │
core ──► {plugin, llm, schema}
    ↑
opencode ◄────── {core, protocol, schema, server, plugin, llm, tui, codemode, script, sdk, tui}
    │
    ├─ tui (core, plugin, sdk, ui)
    ├─ app (client, core, schema, sdk, session-ui, ui)
    └── desktop → app, ui (sidecar: virtual:opencode-server)
```

### Forbidden Edges (CI-checked):
- `core → server/protocol/client` — never
- `schema → any product package` — never
- `protocol → server` — prevented (protocol only depends on schema)
- `sdk-next` (sink) never imported by leaves

## 4. Dual-Stack Reality (V1 + V2)

The repo runs **two parallel stacks**:

| Layer | V1 (Legacy) | V2 (New) | Status |
|---|---|---|---|
| **Tools** | 14 tools in `opencode/src/tool/registry.ts` | 12 builtins in `core/src/tool/builtins.ts` | Both active |
| **Session** | `session/` (V1) | `core/src/session/` (V2) | Both active |
| **Provider** | `provider/provider.ts` (1826 lines) | `llm/` + `session/llm.ts` | Both active |
| **Session/Tools** | `opencode/src/session/` + `tool/registry.ts` | `core/src/session/`, `core/src/tool/` | Both |
| **Config** | V1 `ConfigV1` + migration | V2 `Config` + `ConfigV1` | Both active |
| **Account** | `opencode/src/account/account.ts` | `core/src/account.ts` | Both active |

**Debt Items (from M3 audit 03-A):**
- A1: Triple server (v1 routes + v2 handlers + embedded createRoutes)
- A2: Dual API surface (v1 + v2 handlers)
- A3: V1 schema leakage into V2 code
- A4: V1↔V2 dual-write events
- A5: Dual config pipelines (V1 migrate + V2 native)

## 5. Plugin System

### Current State:
- **Internal plugins** (hardcoded in `plugin/index.ts:66-84`): 8 auth plugins
- **External plugins**: Dynamic import from `.opencode/plugins/`, npm packages
- **Hook surface** (`@opencode-ai/plugin`): `tool`, `auth`, `provider.models`, `config`, `event`, `chat.message/params/headers`, `permission.ask`, `command.execute.before`, `tool.execute.before/after`, `shell.env`, `tool.definition`, `experimental.*`
- **TUI plugins**: Slot system (`TuiHostSlotMap`), keymap layers, plugin manager UI
- **Loader**: `plugin/loader.ts` — dynamic import, npm install on demand, compatibility check

### Plugin Hook Surface (24 hooks):
`tool`, `auth`, `provider.models`, `config`, `event`, `chat.message/params/headers`, `permission.ask`, `command.execute.before`, `tool.execute.before/after`, `shell.env`, `tool.definition`, `experimental.*`

## 5. Configuration System

**Sources (merge order, last wins):**
1. Global: `~/.config/opencode/{config.json, opencode.json, opencode.jsonc}`
2. Project: `.opencode/{opencode.json, opencode.jsonc}` (walking up from cwd)
3. Remote: Well-known URL (`/.well-known/opencode`) via auth
4. `OPENCODE_CONFIG` env var (file path)
5. `OPENCODE_CONFIG_DIR` env var
6. `OPENCODE_CONFIG_CONTENT` env var (inline JSON)
7. `OPENCODE_DISABLE_PROJECT_CONFIG` flag
8. Managed dir (`.opencode/managed/`) → MDM configs
7. macOS managed preferences (`.mobileconfig` via MDM)

**Merge Strategy:** `mergeConfigConcatArrays` concatenates arrays; deep merge for objects. `plugin_origins` tracks provenance per source.

## 6. Service Graph (Server Composition Root)

From `packages/opencode/src/server/routes/instance/httpapi/server.ts:212-312`:

```
LayerNode.group([
  Npm.node, FSUtil.node, Database.node, Auth.node, Account.node, Config.node,
  Env.node, Git.node, Ripgrep.node, Storage.node, Snapshot.node,
  Plugin.node, ModelsDev.node, Provider.node, ProviderAuth.node,
  Agent.node, Skill.node, Discovery.node, Question.node,
  Session.node, SessionProjector.node, SessionStatus.node,
  Todo.node, SessionStatus.node, SessionSummary.node,
  BackgroundJob.node, RuntimeFlags.node,
  EventV2Bridge.node, EventV2.node, InstanceState.node,
  LSP.node, MCP.node, McpAuth.node, PtyTicket.node,
  Ripgrep.node, Ripgrep.node, SessionCompaction.node,
  SessionRevert.node, SessionSummary.node, SessionPrompt.node,
  SessionRunState.node, SessionStatus.node, SessionSummary.node,
  Todo.node, BackgroundJob.node, RuntimeFlags.node,
  EventV2Bridge.node, SessionV2.node, SessionExecution.node,
  SessionRunState.node, SessionCompaction.node,
  SessionRevert.node, SessionSummary.node, SessionPrompt.node,
  ToolRegistry.node, Format.node, Project.node, Vcs.node,
  Workspace.node, Worktree.node, Installation.node,
  httpClient, EventV2.node, ProjectV2.node, ProjectCopy.node,
  PtyTicket.node, Ripgrep.node,
])
+ AppNodeBuilderV1.build(app) + Observability.layer (LAST, #34730)
```

**Key Invariant:** `Observability.layer` MUST be last (bug #34730 — forked fibers capture default stdout logger, corrupting TUI).

## 7. Plugin System Audit

### Current State:
| Aspect | Status |
|---|---|
| Internal plugins | 8 hardcoded (Codex, Copilot, Modal, Gitlab, Poe, Cloudflare, Azure, DigitalOcean, Snowflake, Xai) |
| External (npm) | Dynamic import + `Npm.add()` + compatibility check |
| Config-dir tools | Dynamic `import(pathToFileURL(...))` — namespaced `ns_export` |
| Plugin tools | `p.tool` map from hooks; namespaced `${ns}_${export}` |
| MCP tools | Per-session catalog; `McpCatalog.convertTool` → ToolRegistry |
| TUI Plugins | Slot system (10 named slots), route registry, keymap layers, plugin manager UI |
| Compatibility | `internalPlugins()` hardcoded; `config-dir` tools; `p.tool` hook; V1 config-dir tools |

### TUI Plugin Slots (10):
`app`, `app_bottom`, `home_logo`, `home_prompt`, `home_prompt_right`, `home_bottom`, `home_footer`, `session_prompt`, `session_prompt_right`, `sidebar_title/content/footer`

### Plugin Hook Surface (24):
`tool`, `auth`, `provider.models`, `config`, `event`, `chat.message/params/headers`, `permission.ask`, `command.execute.before`, `tool.execute.before/after`, `shell.env`, `tool.definition`, `experimental.*`

## 9. Debt Items Affecting M4

| ID | Finding | M4 Impact |
|---|---|---|
| A1 | Triple server (V1 routes + V2 handlers + embedded createRoutes) | Must unify in composition |
| A2 | Dual API (V1 + V2 handlers mounted) | Must unify in composition-as-data |
| A3 | V1 schema leakage into V2 | Must resolve before schema-as-data |
| A5 | Dual config pipelines | Must unify into single composition |
| A6 | ServerAuth duplication | Unify in security floor |
| A7 | Composition root order invariant (comment-only) | Must encode in data |
| A8 | Serialized SQLite (Semaphore(1)) | Composition DB may need pooling |
| C3 | Projector version binding missing | Must bind before event-sourcing |
| A8 | Config: dual pipelines (V1 migrate + V2 native) | Must unify into single composition |

---

## Summary

The current architecture is a **hardcoded, imperative composition** with:
- **36 modules** in opencode, 28 in core
- **Dual V1/V2 stacks** running in parallel
- **55-service** hardcoded server composition
- **Hardcoded** CLI commands, HTTP routes, plugin lists, internal plugins
- **Two parallel stacks** (V1 + V2) for tools, providers, sessions, config
- **Plugin system** with 24 hooks but no declarative manifest for built-ins
- **Config** with 8 merge sources, complex precedence
- **Startup** mixes eager + lazy, order-sensitive invariants

**M4 must transform this into:** declarative composition data → validation → dependency resolution → ordered activation → plugin loading → service registration.

No code modifications in this audit phase. All findings documented for M4.2+ design.