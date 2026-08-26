# M0.4 — Contract Inventory

> Machine-readable: `harness/m0/contracts.json`. Each contract lists expected inputs/outputs, invariants, failure behavior, and compatibility promise — audited from `packages/protocol/src/groups/*`, `packages/schema/src/*`, `packages/llm/src/schema/*`, and service interfaces.

## 1. API contracts (Protocol HttpApi)

Declarative groups (17) in `packages/protocol/src/api.ts` + `groups/*`:

| Group | Representative invariants |
|---|---|
| `session` | `POST /session {id}` creates; `GET /session/:id` 404 if missing; `DELETE` removes; concurrent creates are idempotent per id |
| `message` | `POST /session/:id/message` admits one `session_input`; `queue` vs `steer` delivery vocabulary; reusing `prompt/messageID` reconciles exact retry only when session+prompt+delivery match |
| `event` | SSE `GET /event?sessionID=` streams durable `SessionEvent` in seq order; lost connection resumes from last seq |
| `pty` | ticketed WS `GET /pty/:id/connect?ticket=` — 60s TTL, one-time UUID, scoped to ptyID+directory+workspace |
| `file` | lexical + realPath containment (S0.11 Security baseline); absolute/UNC/drive-letter rejected |
| `provider` | `GET /provider` lists discovered models; `POST /provider/:id/oauth/*` handles device-code polling with 15-min deadline |
| `mcp`, `lsp`, `command`, `permission`, `agent`, `skill` | each group carries explicit error union (see `errors.ts`: `InvalidRequestError(400)`, `UpstreamError(502)`, `TimeoutError(504)`) |

**Compatibility promise:** wire shapes are Effect Schema contracts (browser-safe, in `schema`). No breaking shape change without payload version bump (C3 prerequisite).

## 2. Tool contracts

| Tool | Input schema (representative) | Success | Failure | Invariant |
|---|---|---|---|---|
| `bash` | `{command: string, timeout?: number}` | `{status:"completed", output}` bounded at 1 MB | `status:"error"` with error text; permission `bash` gate | never returns false success; background mode not durable (gap 03-C2) |
| `edit`/`write`/`apply_patch` | `{path, oldText?, newText}` exact-match | patched file + diff | permission `edit`; formatter not yet run (gap) | atomic write; concurrent edits serialized via per-path Semaphore (leaks — A7-B7 debt) |
| `read` | `{path, offset?, limit?}` paging 2000 lines / 50KB | text or base64+ mime | external dirs require approval | traversal blocked at 400, not 500 (hardened) |
| `glob`/`grep`/`webfetch`/`websearch`/`question`/`skill`/`todowrite` | per-tool zod schemas | bounded outputs (see 03: rig record 64KB/line 2000 chars) | permission per-tool; websearch only when opencode provider | definition filtering ≠ execution auth (registry has no PermissionV2 dep by design) |

**Compatibility:** tool names + permission actions are part of the model-visible contract. Renames require deprecation window (today `tools` field in PromptInput is deprecated but still parsed).

## 3. Event contracts (3 domains)

- **Durable** (`SessionEvent`): append-only, seq-monotonic, `sourceEventSeqs` provenance. Must survive reload/fork/replay.
- **Live** (`agent/*`, `GlobalBus`): process-local, lost on crash by design.
- **Seam/policy** (`tools/*`, `permission/evaluate`): waterfall with explicit `next()`; dropping `next` vetoes.

## 4. Service contracts (selection)

| Service | Interface file | Key invariants |
|---|---|---|
| `BackgroundJob` | `core/src/background-job.ts:88` | process-local registry; TTL 1h + cap 500 + 5-min sweep (hardened); entries not durable |
| `PermissionV2` | `core/src/permission.ts` | rule-set evaluation; storage-backed `saved` decisions |
| `SessionV2` / `SessionExecution` | `core/src/session/*` | durable admission separate from execution; Location-scoped runner |
| `ToolRegistry` | `core/src/tool/registry.ts` | ApplicationTools ⊕ Location overlay; permission-blind |

## 5. Provider contracts

- Assembly order: models.dev catalog → `provider.models` plugin hook → config entries → env keys → auth.json → `auth.loader` plugins → custom loaders → enabled/disabled filtering.
- Request: exactly one `llm.stream(request)` per turn; streaming via `StreamChunk`, tool dispatch via `ctx.tools`, response via `ProviderModelNotFoundError` typed (hardened path).

## 6. Persistence contracts

- SQLite at `Global.Path.data/opencode.db` (WAL mode, single connection behind Semaphore(1) — bottleneck A8).
- Migrations in `core/src/database/migration.gen.ts`; incompatible historical payloads not yet version-bound (C3).
- Snapshots: git-based, per-worktree.

## 7. UI contracts

- TUI slots: host-published named anchors, contributions ordered by placement.
- App contexts: server/sdk/sync/models/permission/mcp/tabs/platform/settings — all via sdk/client, never server internals.

## 8. Contract test strategy (harness)

`harness/m0/contracts.test.ts` asserts: (a) every HttpApi group has an explicit error union; (b) every tool's input schema round-trips through its declared output fixture; (c) durable event fixtures survive projector version check (pending C3 fix). Failures block migration PRs.

