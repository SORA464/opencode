# M1 — Kernel Extraction Report

**Phase:** M1 Kernel Extraction
**Baseline:** f7ff815fc (blueprint) + d6e796b9e (M0 safety net)
**Date:** 2026-08-26
**Status:** COMPLETE — additive, no behavior change

## 1. Deliverables (M1 scope)

| Deliverable | File | Status |
|---|---|---|
| Kernel package | `packages/kernel/package.json` v1.18.14, exports 11 entry points | ✅ |
| Runtime substrate | `packages/kernel/src/runtime.ts` — re-exports LayerNode substrate under kernel versioning | ✅ |
| Service registry | `packages/kernel/src/service-registry.ts` — typed slots, WELL_KNOWN keys | ✅ |
| Event registry | `packages/kernel/src/event-registry.ts` — 3-domain taxonomy, waterfall result type, versioned defs | ✅ |
| Dependency graph engine | `packages/kernel/src/dependency-graph.ts` — Kahn sort, cycle/missing detection, pure | ✅ |
| Manifest types | `packages/kernel/src/manifest.ts` — opencode.contributes shape, validation | ✅ |
| Plugin loader | `packages/kernel/src/plugin-loader.ts` — PENDING→FAILED lifecycle | ✅ |
| Composition loader | `packages/kernel/src/composition-loader.ts` — ordered layers, conflict report, deterministic sort | ✅ |
| Permission framework | `packages/kernel/src/permission.ts` — SEP floor (3 capabilities), trust tiers | ✅ |
| Config framework | `packages/kernel/src/config.ts` — layered merge + stub validation | ✅ |
| Compatibility bridge | `packages/kernel/src/compatibility.ts` — compatNote helper, version constant | ✅ |

All files typecheck `tsgo --noEmit` (kernel). `bun install` clean (2411 installs).

## 2. Verification

| Gate | Result |
|---|---|
| Golden master `harness/m0/golden-master.test.ts` | 4/4 pass (baseline file counts, blueprint presence, no src moves) |
| Dependency graph harness | No disallowed edge (kernel depends only on effect + @opencode-ai/core via re-export) |
| Turbo typecheck (kernel) | 0 errors (isolated) |
| Regression: `bun install` | No lockfile churn beyond kernel addition |
| Rollback | `git revert` of kernel commit restores previous state; compatibility bridge ensures old imports (`@opencode-ai/core/effect/layer-node`) keep working |

## 3. Compatibility

- Old imports preserved: `import { LayerNode } from "@opencode-ai/core/effect/layer-node"` still works — kernel re-exports are additive, not replacing.
- No service graph change: `packages/opencode/src/server/routes/instance/httpapi/server.ts` still builds its 55-service group directly; kernel composition loader is not yet wired (M4).
- No event bus change: EventV2 remains the durable bus; kernel EventRegistry is a taxonomy companion, not a replacement yet.

## 4. Security / Reliability / Performance / Observability / Recovery

- **Security:** Permission SEP floor compiled into kernel, not patchable; trust-tier model documented. No new privileged surface.
- **Reliability:** Pure dependency graph + lifecycle state machine are unit-testable; no runtime mutation of existing services.
- **Performance:** Kernel is ~300 LOC total; no eager initialization; lazy-mount discipline preserved.
- **Observability:** Composition loader records provenance per row; service registry tracks provider identity.
- **Recovery:** Plugin loader FAILED quarantine + dependency cascade semantics documented; actual fiber supervision lands in M1 follow-up.

## 5. Migration safety

- **No big-bang:** Kernel is a new package, not a rewrite.
- **Reversible:** Deleting `packages/kernel` and reverting its commit restores baseline.
- **Measurable:** Change-detection (`harness/m0/change-detection.ts`) will show exactly 11 new files under `packages/kernel/src/` on next PR.

## 6. Handoff to M2

M2 (Tool System Pluginization) may now proceed. Its entry gate:
- M1 gates green (this report)
- `harness/m0/toolchain.test.ts` green (existing)
- New tool plugin contributions must pass compatibility harness (`compare` old vs kernel-registered tool).

No subsystem has been moved yet — correct per M1's "existing behavior unchanged" requirement.

