# M2.5 — Tool Loader (Deterministic)

> Implementation: `packages/kernel/src/tools/tool-loader.ts`

- **Determinism:** Topologically sorts manifests via `DependencyGraph.build` (Kahn). Same input → same order.
- **Failure isolation:** Each manifest validated and registered individually; one failure does not abort siblings. Failed entries recorded as `FAILED` with error.
- **Compatibility validation:** `compatibility.kernel` range checked stub (real semver check in M2 follow-up).
- **Rollback:** `loaded` vs `failed` lists are the rollback ledger — revert is re-registering previous versions (old manifests retained one release).

Example:

```ts
const loader = new ToolLoader(registry)
const { loaded, failed } = await loader.load(BUILT_IN_MANIFESTS)
// loaded: ["read","write","edit","bash",...]
// failed: [{id:"grep", error:"missing dep read"}] (if read not loaded first — prevented by topo sort)
```

Future: loader will support `unload(id)` with cascade via reverse dependency graph (M4 quiesce barrier).

