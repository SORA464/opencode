# M4.1 — Composition Audit (Hardcoded Inventory)

> Baseline: M3 `7a546a04a`. No code deleted in audit phase.

## 1. Composition roots (imperative)

| Root | File | Hardcoded |
|---|---|---|
| Server bootstrap | `packages/opencode/src/server/routes/instance/httpapi/server.ts:212` `LayerNode.group(~55 services)` | Manual group list, order-sensitive comment #34730 |
| AppRuntime | `packages/opencode/src/effect/app-runtime.ts:58` `AppNodeBuilderV1.build(group[Npm, FSUtil, Database, Auth, Config, ...])` | ~50 nodes |
| Instance bootstrap | `packages/opencode/src/project/instance-store.ts:45` `bootstrap.run` | Config/Plugin/ShareNext/Format/LSP/Vcs/Snapshot fire-and-forget |
| TUI | `packages/opencode/src/cli/cmd/tui.ts:210` `new Worker(worker.ts)` + `Rpc` | Hardcoded worker path, TuiConfig |
| Desktop | `packages/desktop/src/main/index.ts:115` `Effect.gen sidecar spawn` + `background-cli.ts:19` | sidecar v1/v2 switch hardcoded |
| Provider | `packages/opencode/src/provider/provider.ts:108` `BUNDLED_PROVIDERS` map (25 loaders) | Adding provider = code change |
| Tools | `packages/opencode/src/tool/registry.ts` static import list (14 tools) + `core/src/tool/builtins.ts` (12) | Adding tool = code change |
| Config | `packages/opencode/src/config/config.ts:25-28` via `ConfigV1` + `migrate.ts` | Two pipelines |
| Feature flags | `core/src/flag/flag.ts` ~30 vars + tail outside Flag | Env var sprawl |
| Profile/default | None — no declarative profile; default is the hardcoded group above | Adding profile = code change |
| Legacy V1/V2 | `server.ts:154-181` mounts InstanceHttpApi + `@opencode-ai/server` Api side-by-side | Duplicate wiring |

## 2. Hardcoded capability decisions

- Tool `question` enabled only when `client ∈ {app,cli,desktop}` (`registry.ts:202`)
- `patch` vs `edit/write` mutually exclusive for `gpt-*` models
- `websearch` only when `providerID=opencode` or exa/parallel flags
- `lsp` only when `experimentalLspTool` flag
- Provider `custom()` branches: anthropic beta headers, opencode free-tier filtering, github-copilot responses-vs-chat, azure resourceName
- Server port fallback `4096→0` hardcoded in `server/server.ts:83`

## 3. Service construction

Every service is manually constructed via `LayerNode.make({service, layer, deps})` with deps listed imperatively. No manifest declares `inject` deps data-driven.

## 4. Environment overrides

- `process.env` direct mutation ×2 in `provider.ts:312,572` (bypasses `Env.set`)
- `Flag` mixed eager/lazy getters + tail vars (`OPENCODE_AUTH_CONTENT`, `RETRY_BUDGET_MS`, `ALLOW_UNAUTHENTICATED_REMOTE`, etc.) outside Flag

## 5. Legacy V1/V2

- `packages/opencode/src/server/routes/instance/httpapi/server.ts` builds both v1 and v2 APIs.
- `core/src/v1/**` (19 files) consumed by live config/tools/handlers.
- V1 schemas are wire format for v1 API and projection source for V2.

## 6. Summary

All product composition decisions are currently encoded as imperative code. The audit counts **~120 hardcoded wiring points** across 7 roots. Each is a candidate for declarative manifest entry per 04-plugin-model.

