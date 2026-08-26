# M0.1 — Baseline Inventory (Frozen 2026-08-26, commit f7ff815fc)

> Machine-readable companion: `inventory.json` (this directory). Human-readable expansion is this document.
> All paths absolute from repo root `C:\soopcode v2\opencode`. Counts verified via `git ls-files` + `package.json` reads on the frozen baseline. No code is modified in M0; this inventory is the comparison datum for every future plugin-era phase.

## 1. Package structure

### 1.1 Root

| Field | Value |
|---|---|
| `packageManager` | `bun@1.3.14` |
| `workspaces.packages` | `packages/*`, `packages/console/*`, `packages/stats/*`, `packages/sdk/js`, `packages/slack` |
| `workspaces.catalog` | 42 pinned deps incl. `effect@4.0.0-beta.83`, `hono@4.12.34`, `solid-js@1.9.10`, `vite@7.3.5`, `zod@4.1.8` |

### 1.2 Workspaces (31 with package.json + 5 dirs without)

| Path | Package name | Kind |
|---|---|---|
| `packages/opencode` | `opencode` | CLI product shell (`bin: opencode`) |
| `packages/core` | `@opencode-ai/core` | domain core |
| `packages/server` | `@opencode-ai/server` | generic HTTP server |
| `packages/protocol` | `@opencode-ai/protocol` | HttpApi declarations |
| `packages/schema` | `@opencode-ai/schema` | wire contracts |
| `packages/llm` | `@opencode-ai/llm` | LLM abstraction |
| `packages/plugin` | `@opencode-ai/plugin` | plugin SDK |
| `packages/client` | `@opencode-ai/client` | generated typed client |
| `packages/sdk-next` | `@opencode-ai/sdk-next` | embedded SDK |
| `packages/sdk/js` | `@opencode-ai/sdk` | legacy JS SDK |
| `packages/tui` | `@opencode-ai/tui` | terminal UI |
| `packages/app` | `@opencode-ai/app` | web UI (SolidStart) |
| `packages/desktop` | `@opencode-ai/desktop` | Electron shell |
| `packages/ui` | `@opencode-ai/ui` | design system |
| `packages/session-ui` | `@opencode-ai/session-ui` | conversation UI |
| `packages/cli` | `@opencode-ai/cli` | `lildax` wrapper |
| `packages/web` | `@opencode-ai/web` | marketing site |
| `packages/enterprise` | `@opencode-ai/enterprise` | enterprise app |
| `packages/slack` | `@opencode-ai/slack` | Slack bot |
| `packages/function` | `@opencode-ai/function` | CF Worker helpers |
| `packages/codemode` | `@opencode-ai/codemode` | sandboxed interpreter |
| `packages/http-recorder` | `@opencode-ai/http-recorder` | test VCR |
| `packages/httpapi-codegen` | `@opencode-ai/httpapi-codegen` | codegen |
| `packages/script` | `@opencode-ai/script` | build scripts |
| `packages/storybook` | `@opencode-ai/storybook` | Storybook |
| `packages/effect-drizzle-sqlite` | `@opencode-ai/effect-drizzle-sqlite` | Drizzle adapter |
| `packages/effect-sqlite-node` | `@opencode-ai/effect-sqlite-node` | SQLite glue |
| `packages/console/app` | `@opencode-ai/console-app` | console app |
| `packages/console/core` | `@opencode-ai/console-core` | console domain |
| `packages/stats/app` | `@opencode-ai/stats-app` | stats app |
| `packages/stats/core` | `@opencode-ai/stats-core` | stats domain |
| `packages/stats/server` | `@opencode-ai/stats-server` | stats server |
| `sdks/vscode` | `opencode` | VS Code extension |
| `packages/containers`, `packages/docs`, `packages/identity`, `packages/sdk`, `packages/console/{function,mail,resource,support}` | — | infra/docs dirs without package.json |
| `infra/*.ts` (8 files) | — | SST stacks |

Machine-readable: `inventory.json` → `workspaces[]`.

## 2. Module structure (top-level src dirs)

### `packages/opencode/src` (32 dirs)

`account, acp, agent, auth, background, bus, cli, command, config, control-plane, effect, env, format, git, id, ide, image, installation, lsp, mcp, patch, permission, plugin, project, provider, question, server, session, share, skill, snapshot, storage, sync, tool, util, worktree` — full table with one-line purposes in `inventory.json:modules.opencode`.

### `packages/core/src` (28 dirs)

`account, config, control-plane, credential, database, effect, event, filesystem, flag, github-copilot, id, image, installation, integration, oauth, observability, permission, plugin, project, pty, reference, ripgrep, session, share, skill, system-context, tool, util, v1` — detailed in inventory.

### Other packages

Core packages above each expose 1–3 entry points; full export map in `inventory.json:exports`.

## 3. Counts (frozen datum)

| Metric | Value | Source |
|---|---|---|
| Tracked files (`git ls-files \| wc -l`) | 6,410 | `git ls-files` on f7ff815fc |
| Symlink entries (`git ls-files -s \| grep ^120000`) | 58 (down from 60 after de-symlinking the two `custom-elements.d.ts` stubs) | `git ls-files -s` |
| HttpApi endpoint groups | 17 | `packages/protocol/src/api.ts` |
| CLI commands (yargs) | ~25 | `packages/opencode/src/index.ts` static imports |
| Tools (v1 shipped) | 14 | `tool/registry.ts` static list |
| Tools (v2 builtins) | 12 | `core/src/tool/builtins.ts` |
| Provider loaders (BUNDLED_PROVIDERS) | 25 | `provider/provider.ts:108` |
| TUI host slots | 10 | `packages/plugin/src/tui.ts:TuiHostSlotMap` |

## 4. How to compare future changes

1. Regenerate `inventory.json` via `harness/m0/inventory.ts` (provided in §12).
2. Diff against committed `docs/m0/inventory.json` — any added/removed workspace, changed layering edge, or count drift is a review trigger before merge.
3. Human-readable diff: re-render this document via the same script and compare.

## 5. Related M0 deliverables

- Runtime topology → `02-runtime-topology.md`
- Dependency graph → `03-dependency-graph.md` + `dependency-graph.dot`
- Environment / DB / contracts → `04-contract-inventory.md` §§4–6 and companion JSONs

