# M0.2 — Runtime Topology Map

> Companion JSON: `harness/m0/runtime-topology.json` (generated). Diagram source: `harness/m0/runtime-topology.mmd`.

## 1. Process model (frozen)

```
CLI (Bun, src/index.ts:1 yargs) ──► Server.listen() ──► Node http + Effect HttpRouter
                                 │                    Scope.makeUnsafe + Layer.buildWithMemoMap
                                 │                    HttpApiApp.createRoutes (310 lines, 7 groups: root/event-sse/pty-ws/instance/UI/doc)
                                 │                    WebSocketTracker + MDNS
                                 │
                                 ├─► TUI (main + Worker thread Rpc) ──► @opencode-ai/tui (Solid/opentui)  [src/cli/cmd/tui.ts:210 Worker]
                                 │                                      main: GlobalBus → Rpc.emit
                                 │                                      worker: Server.Default().app.fetch (lazy Default at server/server.ts:56) + Server.listen for external URL
                                 │
                                 └─► Desktop Main (Electron main/index.ts:115 Effect.gen sidecar spawn)
                                                          ├─ Sidecar v1 utilityProcess.fork(sidecar.js) → virtual:opencode-server
                                                          └─ Sidecar v2 Bun binary staged to userData/cli/<ver>/opencode (background-cli.ts:19)
Session plane (in-process): SessionExecution (process-global, per-Session fibers, SessionRunCoordinator + SessionStore + LocationServiceMap.get only on drain) → SessionRunner/LLM/tools/permissions are Location-scoped (InstanceState).
```

## 2. Startup sequence (cold CLI path)

1. yargs parse (`src/index.ts:45`) registers all ~25 commands eagerly; middleware sets `OPENCODE_*` env + `Heap.start()`.
2. Dispatch → `effectCmd` gate (`src/cli/effect-cmd.ts:69`): `instance=false` (serve/web) runs bare `AppRuntime.runPromise`; else load `InstanceStore` → `InstanceContext` → handler with `InstanceRef`.
3. `AppRuntime` (`src/effect/app-runtime.ts:58`): `ManagedRuntime.make(AppLayer, memoMap)` where `AppLayer = AppNodeBuilderV1.build(LayerNode.group([...~50 nodes...]))` → `Layer.provideMerge(Observability.layer)` **last** (order invariant #34730: forked fibers must not capture default stdout logger).
4. `LayerNode.compile` (`core/src/effect/layer-node.ts:250`) flattens group, cycle-checks, memoizes.
5. Per-directory bootstrap (`project/instance-store.ts:45` + `instance-context.ts` ScopedCache): `InstanceBootstrap` wraps Config/Plugin/ShareNext/Format/LSP/Vcs/Snapshot fire-and-forget `init()`s (forked).
6. Command-specific: `serve`→`listenerLayer` (=HttpRouter.serve(createRoutes)+WebSocketTracker+serverLayer); `tui`→Worker spawn→Rpc→TuiConfig.get→validateSession→runTui via `AppNodeBuilder.build(Global.node)`.

Lazy entry points (never pay unless branch taken): `Server` dynamic imports in serve/web/run/acp/attach; TUI stack (`runInteractiveMode`, `../tui/layer`); every `@ai-sdk/*` provider; `code-mode`; plugin entries; OpenAPI/doc response and embedded web manifest (`util/lazy.ts`).

## 3. Service graph (composition root)

`packages/opencode/src/server/routes/instance/httpapi/server.ts:212-269` — single `LayerNode.group` containing ~55 services ordered deterministically; `app` subtree via `AppNodeBuilderV1.build(app)` plus `Observability.layer` tail. Projectors self-register at module import (`server/init-projectors.ts`).

## 4. Event flows

- **Durable**: `SessionEvent` append-only log → `deriveMessages()` projection → `session/event` broadcast → fork/resume/UI. Invariant: model-visible ⇒ logged.
- **Live**: `agent/*` (inbox/status/request/pre-step/turn-stopping), `tools/*` waterfalls, `fs/*` capability events.
- **Bridge**: `event-v2-bridge.ts` (30+ sites) — flagged as debt to move into event layer (03-A5).

## 5. Comparison method

Regenerate via `harness/m0/runtime-topology.ts` (parses `server/server.ts` + `cli/effect-cmd.ts` + `effect/app-runtime.ts` to emit the JSON + mermaid). Diff against committed JSON; any added process, reordered layer, or new eager import is a review trigger.

