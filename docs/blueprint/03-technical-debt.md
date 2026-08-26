# 03 — Technical Debt Inventory (migration-relevant, evidence-cited)

Complete sweep with file:line verification. **Nothing is removed in this phase**; each item carries
its migration disposition for the blueprint.

## A. Structural (highest migration leverage)

| # | Finding | Evidence | Risk | Blueprint disposition |
|---|---|---|---|---|
| A1 | **Triple server implementation**: opencode-local v1 routes + `packages/server` v2 handlers + embedded `createRoutes`; `packages/opencode` depends on `@opencode-ai/server` while owning a parallel `src/server` tree | httpapi/server.ts:154-181, 276-283; cli mixes both | High — auth/middleware parity drift (ServerAuth already diverging: `Flag` vs raw env) | Kernel phase collapses to ONE server package; v1 API becomes a compatibility plugin |
| A2 | **Dual-mounted v1+v2 APIs** with duplicated handler/schema families (e.g., session handlers 404 vs 385 lines; 458-line schema twin) | httpapi/server.ts:154-181; groups/session.ts | High — every feature lands twice | Freeze v1 additions now; v1 becomes `compat-api-v1` bundle; burn down per-endpoint |
| A3 | **V1 schema leakage**: `core/src/v1/**` (19 files incl. 240-line migrate.ts) consumed by live config/tools/handlers AND V2 projector | config.ts:25-28; tool/tool.ts:1-3; session/projector.ts:215-312 | High | Treat as frozen compat surface inside the compat bundle; projector reads become the only sanctioned consumer |
| A4 | **V1↔V2 dual-write events**: V2 session creation publishes `SessionV1.Event.Created` | core/src/session.ts:220,242 | High correctness coupling | Isolate into single legacy-events adapter module (one-file removal later) |
| A5 | **Two config pipelines**: opencode loads through ConfigV1+migrate and re-wraps siblings; core defines V2 config | opencode/config/config.ts:25-28 | High — features land twice | Cutover gate in Migration Phase 2 |
| A6 | **God modules**: provider/provider.ts (1,826 L, 61 exports), lsp/server.ts (1,754), provider/transform.ts (1,689, self-labeled "stupid inefficient dogshit" hot path), copilot responses model (1,610), session/prompt.ts (1,516); god-consumer session handler yielding 14 services | file sizes; handlers/session.ts:1-41 | High | Split along future plugin seams BEFORE extraction (catalog-sync / auth-state / schema / service) |
| A7 | Composition root instantiates ~55 services with an order invariant encoded only in prose (#34730 TUI stdout corruption if Observability not last) | httpapi/server.ts:212-269, 307-310 | High | Encode as kernel-level boot assertion; then data-drive composition |
| A8 | Serialized SQLite: single connection behind `Semaphore(1)` + global migration lock | database/sqlite.*:115-122; migration.ts:11 | High throughput ceiling | Prereq for any multi-tenant/scale story; WAL/read-pool strategy doc'd in 11 |

## B. Duplication

| # | Finding | Disposition |
|---|---|---|
| B1 | ServerAuth duplicated opencode↔server, diverging | Merge to one canonical module (security item) |
| B2 | ModelStatus literal ×3 (provider/model-status, v1/config/provider, models-dev catalog subset — test asserts divergence!) | Single source in schema; derive variants |
| B3 | Two question systems (v1 registry-wired vs QuestionV2) | Point v1 registry at QuestionV2 when parity lands |
| B4 | Two account modules (473-line v1 namespace vs AccountV2+sql used only by tests) | Adopt or shelf explicitly |
| B5 | Event bridge sprinkled at 30+ call sites (`event-v2-bridge`) | Move bridging into event layer itself |
| B6 | Legacy OpenAPI cosmetics ~350 lines + Legacy* schemas to keep generated SDK stable | Regenerate clients off v2 spec, retire |
| B7 | Hand-rolled lock Maps (edit.ts:35, snapshot:55) while KeyedMutex exists; never evict (leak keyed by path) | Replace with KeyedMutex |

## C. Workarounds / hazards (keep-visible list)

| # | Finding | Note |
|---|---|---|
| C1 | `process.env` direct mutation ×2 in provider.ts ("Env.set only updates a shallow copy") | Fix Env semantics during provider split |
| C2 | V2 tool layer TODO walls: bash (12 deferred capabilities), edit/write/file-mutation missing formatter/watcher/snapshot/undo safety nets v1 had | Parity backlog gates any v1 retirement |
| C3 | Durable projectors not bound to payload version ("incompatible historical payloads" unsupported) | Version-bind before any event shape change — hard prerequisite for plugin-era event contracts |
| C4 | MCP workarounds pinned to four upstream issue URLs | Wrap each behind named helper w/ expiry test |
| C5 | `locationServiceMapLayer` eager compat singleton consumed by 10+ sites | Replace call-sites with explicit builder |
| C6 | Deprecated-but-parsed hot-path fields (`tools` in PromptInput; EventV2.listen used internally) | Warning window → remove |
| C7 | PTY v2 route missing graceful-shutdown socket tracking before client migration | Close before advertising stable |

## D. Hardcoded externals / sprawl

| # | Finding | Disposition |
|---|---|---|
| D1 | models.dev URL + string-equality cache naming; console/api endpoints picked independently in 3 files; 5 unversioned update-probe sources; ripgrep tarball OK but ESLint LSP zip fetched from moving `main` branch | Centralize endpoints; pin ESLint artifact (**supply-chain high**) |
| D2 | Env-var sprawl: Flag holds ~30 but a long tail lives outside (OPENCODE_AUTH_CONTENT, RETRY_BUDGET_MS, ALLOW_UNAUTHENTICATED_REMOTE, …) with mixed snapshot/live semantics | Sweep into Flag; document access rule |
| D3 | Referer header copy-pasted across 6 provider plugins | Hoist to shared util |

## E. Startup/laziness debt

Static import of 28 command modules at CLI entry (contradicts stated policy; Heap.start() runs always);
module-scope construction of heavy Effect layers (`routes = createRoutes()`, locationServiceMapLayer).
Blueprint converts these into kernel-managed lazy mounts — turning existing policy violations into
architecture.

## F. Dead code (confirmed unused)

`opencode/src/temporary.ts` + its dev script (second CLI bootstrap, zero importers);
`core/src/public-event-manifest.ts` (zero importers). Classified REMOVE-EVENTUALLY; untouched now.
