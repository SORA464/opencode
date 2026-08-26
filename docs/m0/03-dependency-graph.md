# M0.3 — Dependency Graph

> Machine-readable: `harness/m0/dependency-graph.json` + `dependency-graph.dot`. Render with `dot -Tsvg`.

## 1. Package-level allowed directions (enforced today by AGENTS.md + turbo typecheck)

```
schema ─┬─► protocol ──► server ──► opencode ──► frontends (via sdk/client)
        │                ▲           ▲
        ├─► llm ─────────┘           │
        └─► core ────────────────────┘
              ▲
           plugin, llm, effect adapters
```

Textual rules (quoted):
- "Keep runtime dependencies directed from Schema to Core and Protocol, then from Core and Protocol to Server."
- "Protocol owns middleware placement, while Server injects concrete keys so Core service identities stay downstream."
- `schema` leaf — never depends on others; `client` runtime depends only on `schema+protocol`.

## 2. Measured edges (runtime `dependencies` only, from `package.json` reads)

| From | → To |
|---|---|
| `protocol` | `schema` |
| `server` | `core`, `protocol` |
| `core` | `schema`, `plugin`, `llm` |
| `client` | `schema`, `protocol` |
| `opencode` | `core`, `protocol`, `schema`, `server`, `plugin`, `llm`, `tui`, `sdk`, `codemode` |
| `tui` | `core`, `plugin`, `sdk`, `ui` |
| `desktop` | `app`, `ui` (+ sidecar alias `virtual:opencode-server` → `opencode/src/server/server.ts`) |
| `app` | `client` (vendored tgz), `core`, `session-ui`, `ui` |

## 3. Forbidden edges (CI-enforced in M0 harness)

`core → server/protocol/client` must never appear; `schema → any product package` must never appear;
`sdk-next` is a sink (depends on `client+core+server`) and must never be imported by leaves.
Harness: `harness/m0/dependency-graph.test.ts` asserts these by parsing `package.json` workspaces.

## 4. Module-level hot edges

- `server/api.ts → protocol/api.ts` (makeDefaultApi injection)
- `server/routes/* → core/{database,event,session,permission,pty,workspace}` (18 handler files)
- `opencode/httpapi/server.ts (composition root) → ~40 opencode services + core nodes`
- `opencode/session/* → provider, tool/registry, lsp, config`
- `core/session/runner/* → @opencode-ai/llm` (Route model)
- `tui/cli/app/session-ui/enterprise/slack → sdk/client only` (never server internals)

## 5. Debt-relevant deviations (from 03)

- `core ↔ opencode` config gravity (two pipelines) — tracked as A5.
- `opencode` depending on `@opencode-ai/server` while owning parallel `src/server` — triple-server debt A1.
- God modules (>1.5k lines) as highly-connected hubs — tracked for seam splits (A6).

## 6. How to compare

`harness/m0/dependency-graph.ts` re-parses `package.json` workspaces and selected `import` graphs via `rg` and emits `dependency-graph.json`. CI fails on any new disallowed edge.

