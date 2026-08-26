# 02 — OpenCode Architectural Audit (v1.18.14 baseline)

Evidence basis: full-repo sweeps of `packages/*` (three parallel audits: subsystem/dependency map,
tool/provider/UI inventory, technical-debt grep with file:line verification). Nothing modified.

## 1. Package inventory (runtime-relevant subset)

| Package | Purpose |
|---|---|
| `packages/schema` | Browser-safe Effect-Schema contracts; leaf dependency; V1 subtree quarantined by convention |
| `packages/protocol` | Declarative HttpApi route tree (17 groups) + middleware *placement*; deps: schema |
| `packages/llm` | Effect-native LLM core: Route model (Protocol×Endpoint×Auth×Framing), 6 protocols, 11 provider facades; deps: schema |
| `packages/core` | Domain core: SQLite+migrations, EventV2 durable bus, SessionV2 runner, canonical ToolRegistry, filesystem/watcher, pty, provider catalog, permission store, plugin host runtime, system-context, Effect DI kernel (`LayerNode`/`makeRuntime`) |
| `packages/server` | Generic HTTP assembly: mounts Protocol API over Core services; auth/CORS/middleware |
| `packages/plugin` | Public plugin SDK: v1 promise hooks (`tool`, `auth`, `tui`, …) + v2 `effect`/`promise` SDKs |
| `packages/opencode` | Product shell: CLI (~25 commands), TUI host, headless server bootstrap, **composition root**, v1 session/provider/tool runtimes |
| `packages/client` / `sdk/js` / `sdk-next` | Codegen'd typed clients; embedded all-in-one SDK |
| `packages/tui` / `app` / `desktop` / `session-ui` / `ui` | Terminal UI (slot-plugin runtime), web renderer, Electron shell (sidecar server, WSL subsystem, auto-update), shared conversation components/design system |
| `packages/web`, `enterprise`, `console/*`, `stats/*`, `function`, `slack`, `codemode`, `http-recorder`, `httpapi-codegen`, `storybook`, `effect-*` | Marketing/docs, cloud apps, analytics, Slack bot, sandboxed code interpreter, test VCR, codegen, vendored adapters |

**Declared layering (AGENTS.md, quoted):**
- "Keep runtime dependencies directed from Schema to Core and Protocol, then from Core and Protocol
  to Server. Client runtime code may depend on Schema and Protocol but never Core or Server."
- "Protocol owns middleware placement, while Server injects concrete keys so Core service identities
  stay downstream."
- LLM package: "providers import protocol routes… Protocols do not import provider facades"; session/
  permissions/plugins stay out of `llm`.
- Tool registry: "`ApplicationTools.Service` is process-scoped… `ToolRegistry.Service` is Location-scoped";
  the registry performs no authorization — definition filtering ≠ execution approval.
- SessionV2 rules: durable admission separate from execution; one explicit `llm.stream(request)` per
  turn; runner/model-resolution/tool-registry/permissions/filesystem are **Location-scoped**.

Net direction: `schema → {protocol, llm} → core(+plugin) → server → opencode(composition root) → frontends via sdk/client only`.

## 2. Subsystem classification (Phase-2 questions answered per component)

Verdicts: **CORE** (kernel-bound), **SERVICE→PLUGIN** (becomes a first-party bundled plugin),
**KEEP-AS-IS** (already seam-shaped), **MERGE/SPLIT**, **RETIRE-EVENTUALLY**.

### Kernel candidates (stay in core)
| Component | Why it is kernel |
|---|---|
| Effect DI substrate (`core/effect/{layer-node,app-node,runtime,keyed-mutex}`) | already the de-facto service graph builder |
| EventV2 durable bus + projectors | durability backbone; analog of dsh session-event domain |
| Database + migrations | persistence substrate |
| Plugin loader/host + lifecycle (to be built out) | kernel by definition |
| Permission enforcement point (PermissionV2 evaluate) | security boundary — must be non-unloadable (see 05) |
| Config loading + Flag/env layer | composition input |
| Global paths/credential storage | platform substrate |
| Schema contracts | the wire/storage vocabulary every plugin speaks |

### Service→PLUGIN candidates (first-party bundles)
| Current home | Becomes | Notes |
|---|---|---|
| `opencode/src/tool/*` (15 v1 tools) + `core/src/tool/builtins.ts` (12 v2 tools) | `bundle-tools` | v2 registry is ready; AGENTS.md itself lists unported tools (task/LSP/code-mode/MCP/plugin tools) as the port backlog |
| `opencode/src/provider/provider.ts` (25 dynamic loaders) + `llm/providers/*` | per-provider plugins on an `llm.adapter` seam | models.dev catalog stays a core service feeding discovery |
| `session/processor+llm+retry+compaction` (v1 loop) and `core/session/runner*` (v2 loop) | `plugin-agent-loop` behind an AgentFactory seam | dsh-proven pattern; do late |
| `mcp/*` | `plugin-mcp-bridge` | already pipeline-shaped (tools/prompts/resources/status) |
| `lsp/*` | `plugin-lsp` | long-running sidecars = effect-owned resources |
| `acp/*` | `plugin-acp` (subagent transport seam) | mirrors dsh `ctx.subagents` |
| `snapshot`, `worktree`, `share`, `skill`, `command`(custom), `question`, `format`, `ide`, `git`, `image`, `sync`, `control-plane`, `background/job` | individual service plugins | all are already Layer services consumed via the composition root |
| TUI feature-plugins/slots (9 builtins) | unchanged — already plugin-shaped | most mature UI seam in repo |
| app settings/dialogs/themes; desktop menu/updater/WSL | UI bundle + platform bundle | see 07 |

### KEEP-AS-IS seams (formalize, don't rewrite)
- `.opencode` config-dir conventions (agents/modes, commands, tools, skills, plugins, themes).
- npm-installed providers (`model.api.npm` → dynamic factory import).
- MCP surfacing pipeline (per-tool permissions, prompts→commands, resources→read tool).
- Client-gated tool materialization (`question` by client type; patch-vs-edit/write by model family) —
  precedent for environment-aware registration.
- Desktop `platform` bridge: web/desktop renderers share one `AppInterface` with injected platform context.

## 3. Startup topology (facts that shape kernel design)

- CLI entry statically imports ~28 command modules (contrary to stated lazy-import policy); heavy
  surfaces (Server, TUI stack, providers, tree-sitter, OpenAPI doc, plugin entries) load lazily today.
- The composition root (`httpapi/server.ts`) instantiates ~55 services in one LayerNode group and has
  an order-sensitive invariant encoded only in a comment ("Observability.layer last or forked fibers
  corrupt TUI stdout", #34730). Projectors self-register at module import.
- This is exactly the class of problem Cordis solves with `inject`; our LayerNode graph already
  provides ordering — what's missing is *declarative, data-driven composition* and late mount/unmount.

## 4. Dual-stack reality (the migration gift)

The repo already runs **v1 and v2 side-by-side**: two HTTP API generations mounted in one server
(`httpapi/server.ts` builds InstanceHttpApi AND mounts `@opencode-ai/server/handlers` Api), two tool
registries, two question systems, two account modules, two config pipelines. Painful as debt (03),
this is structurally identical to a plugin-era cutover: the v2 surface is effectively the first
"new architecture" coexisting with the legacy one. The blueprint exploits this rather than fighting it.

## 5. Frontend truth

Web/desktop/TUI all consume the same server through generated SDK clients; desktop contributes only a
platform context. Therefore UI pluginization is primarily (a) generalizing the TUI slot/route runtime,
(b) adding an equivalent slot/registry mechanism to the SolidJS app shell, (c) keeping the desktop as
a platform-plugin host. No frontend rewrite is implied.
