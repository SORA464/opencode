# 04 — Everything-Is-A-Plugin Capability Model

Design target: every capability below becomes **registrable, replaceable, and removable without
editing core**. Classification per capability: *seam* (definition+provider+consumer triad),
*event* (observe/intercept), or *bundle* (distribution of registrations).

## 1. Capability catalog

| Domain | Capabilities | Mechanism | Today's seed |
|---|---|---|---|
| Model | providers, model catalogs, auth flows, small-model selection, request/response transforms | `llm.adapter` seam + `llm/*` events | `@opencode-ai/llm` (11 facades), BUNDLED_PROVIDERS loaders, plugin `provider.models` hook |
| Tools | built-in tools, config-dir tools, plugin tools, MCP tools, code-mode aggregate | tool registration on scoped registries + `tools/pre-execute` / `tools/post-execute` waterfalls | v2 ToolRegistry overlay algebra (ApplicationTools ⊕ Location), v1 registry hooks incl. `tool.definition` rewrite |
| Agents | agent presets/modes, subagent transports (in-proc child ↔ ACP ↔ remote), loop strategy | `agents.factory` seam + agent-preset composition (per-agent isolated realm) | agent/agent.ts build/plan/custom; acp/*; task tool |
| Prompts | system-prompt sections, dynamic descriptions, reminders, skills injection | prompt-assembly waterfall (`prompt/system` analog of dsh `system-prompt`) | session/prompt/*.txt per family; skill tool; DynamicDescription hack |
| Workflows | commands (user-invoked), plan mode, custom command markdown, background jobs | command registry + jobs service (+ `job_*` tools) | command/index.ts (incl. MCP prompts→commands), plan tool, background/job.ts |
| Execution world | filesystem provider, subprocess/shell backend, PTY backend, sandbox policy, watcher | one shared `execution.world` seam (dsh-validated: swap moves Bash+PTY+LSP together) | core filesystem/fff, pty bun/node split, permission evaluate |
| Knowledge | retrieval/indexing/search/memory systems, glossary | context-source plugins feeding the prompt waterfall via `agent.inject()`-equivalent | system-context registry/builtins; skill loader |
| Storage | session persistence backend, snapshot store, KV/draft stores | storage seam behind EventV2/projector contract | database+drizzle; snapshot/git; JSON storage service |
| Integrations | MCP servers, GitHub app, Slack bot, IDE/LSP, share links, cloud control-plane | connector plugins (each = auth + client + tool/command contributions) | mcp/*, github.handler, slack pkg, ide/*, share/*, sync/*, control-plane/* |
| Observability | logging sinks, OTLP tracing, usage stats | telemetry seam (`telemetry/*`) — observe-only by construction | observability/{logging,otlp}, stats packages |
| Security | credential providers, approval policies, protected-path rules | **policy contributes rules; enforcement stays in kernel** (non-negotiable, see 05 §4) | permission evaluate/saved; credential/, oauth/; filesystem/protected |
| Commerce | billing/entitlements/quota (future hosted tier) | entitlement seam consulted by kernel at admission points | none today (console/enterprise exist upstream-side) |
| UI | views, panels, sidebar widgets, dialogs, settings pages, themes, dashboards, terminal panels, inspector/monitoring views | UI slot/route registries per renderer (07) | TUI slot runtime (9 builtin feature-plugins); app contexts/themes; desktop platform bridge |
| Runtime surfaces | headless server, web server, TUI host, ACP editor host | **profiles** (deployment compositions), not plugins themselves | serve/web/tui/acp CLI commands |

## 2. Registration uniformity rule

One manifest shape for everything (package.json extension field, working name `opencode.contributes`),
mirroring dsh's `dsh.bundle.patch` but field-scoped:

```jsonc
{
  "opencode": {
    "plugin": "./src/index.ts",          // apply(ctx) entry — function/object/class forms
    "inject": ["tools", "llm.adapter"],  // hard deps; kernel holds plugin PENDING until satisfied
    "contributes": {                      // declarative rows; imperative API remains available
      "tools": [{ "id": "my-tool", "...": "Tool.make-compatible descriptor" }],
      "providers": [{ "id": "acme", "npm": "@acme/ai-sdk" }],
      "commands": [{ "name": "acme:deploy", "title": "Deploy" }],
      "ui": { "slots": ["session_sidebar"], "routes": ["/acme"] },
      "config": { "schema": "./schema.json" }
    }
  }
}
```

Declarative rows lower the floor (no code for trivial contributions); the imperative `apply(ctx)`
covers everything else. Both funnel into the same kernel registries.

## 3. Event architecture (target)

Three domains, mirroring the audit's existing split:
1. **Durable** (EventV2): facts that survive restart; projected history; versioned payloads
   (prerequisite C3 from 03 — bind projector to payload version first).
2. **Live** (`agent/*`, `session/*` in-memory): coordination + status; lost on crash by design.
3. **Seam/policy** waterfalls: `request/*`, `tools/pre-execute|execute|post-execute`,
   `prompt/system`, `permission/evaluate` (kernel-mediated). Waterfalls require an explicit
   continuation result type; a lint rule + runtime warning flags dropped `next()` (dsh footgun #2).

Delivery semantics per domain: broadcast / ordered-serial / parallel / waterfall — matching dsh's
contracts but with the veto made explicit.

## 4. What deliberately does NOT become a plugin

Kernel pieces (05), the schema contracts plugins speak, the durable log format itself (plugins extend
it via declaration-merged event maps, they don't replace it), and the security enforcement point.
"Everything is a plugin" describes *capability supply*, not *absence of an enforcement core*.
