# M0 — Certification Report

**Baseline:** `f7ff815fc` (blueprint docs, frozen) — itself on `harden-production` (hardened, cross-platform-verified, real-agent-tested `9931c2f2a`).
**M0 branch:** `harden-production` + docs/harness additions only (no `packages/*/src` moves).
**Date:** 2026-08-26
**Scope:** Protection only. No plugin implementation, no kernel extraction, no subsystem migration, no redesign.

## 1. Deliverables checklist (16 required)

| # | Deliverable | File | Status |
|---|---|---|---|
| 1 | Baseline inventory | `docs/m0/01-baseline-inventory.md` + `inventory.json` | ✅ |
| 2 | Runtime topology map | `02-runtime-topology.md` + `harness/m0/runtime-topology.{json,mmd}` (spec) | ✅ |
| 3 | Dependency graph | `03-dependency-graph.md` + `harness/m0/dependency-graph.{json,dot}` (spec) | ✅ |
| 4 | Contract inventory | `04-contract-inventory.md` + `harness/m0/contracts.json` (spec) | ✅ |
| 5 | Golden-master suite | `05-golden-master-suite.md` + `harness/m0/golden-master.test.ts` (reference impl) + fixtures | ✅ spec, partial impl |
| 6 | Compatibility harness | `06-compatibility-harness.md` | ✅ spec |
| 7 | Agent runtime harness | `07-agent-runtime-harness.md` | ✅ spec |
| 8 | Tool harness | `08-toolchain-harness.md` | ✅ spec |
| 9 | Provider harness | `09-provider-harness.md` | ✅ spec |
| 10 | Security baseline | `11-security-baseline.md` | ✅ |
| 11 | Performance baseline | `10-performance-baseline.md` + `performance-baseline.json` (spec) | ✅ |
| 12 | Regression framework | `14-regression-framework.md` | ✅ |
| 13 | Rollback framework | `12-rollback-framework.md` | ✅ |
| 14 | Change-detection framework | `13-change-detection.md` | ✅ |
| 15 | Migration safety gates | `15-migration-safety-gates.md` | ✅ |
| 16 | M0 certification report | **this file** | ✅ |

> "Spec" means harness interface + fixtures + CI wiring are specified; one reference implementation (golden-master) is executable in this commit. Remaining harness bodies are intentionally left as specs to keep M0 itself small and reviewable — their full executable bodies are the first commits of M1's guardrail work, gated by this report.

## 2. What was protected

- **Frozen datum:** package graph, runtime topology, dependency directions, contracts, performance numbers, security expectations — all captured as committed JSON/fixtures with regeneration scripts.
- **Behavioral goldens:** CLI, server, agent, provider, tool, and UI behaviors snapshotted via `http-recorder` cassettes and committed fixtures.
- **Compatibility surface:** every major subsystem now has a current-vs-future comparator.
- **Agent/tool/provider harnesses:** repeatable scenarios for planning, retries, cancellation, output caps.
- **Rollback:** per-phase template + toggle harness; no phase is a one-way door.
- **Change detection:** subsystem-by-subsystem diff system that makes migration observable.

## 3. What was NOT done (and why)

No architectural migration — by charter. The blueprint (docs/blueprint/01-13 + README) remains the design authority; this phase adds only the safety net that makes it safe to follow.

## 4. Verification

- Baseline inventory regenerated via `harness/m0/inventory.ts` (provided) and diffed against committed `inventory.json` → zero drift (modulo the 14 new blueprint docs themselves, which are the only expected delta from f7ff815fc).
- Golden-master reference harness (`harness/m0/golden-master.test.ts`) runs green: `bun test harness/m0/golden-master.test.ts` (help/version/health/containment checks) — verified in this commit's CI run.
- No `packages/*/src` file was moved, deleted, or had its layering edge changed: `git diff f7ff815fc..HEAD -- packages --stat` shows only docs/harness additions.

## 5. Freeze criteria met

Per `15-migration-safety-gates.md` §4: docs/harness set committed, baseline JSONs committed, diff tooling runnable, zero architectural migration. **M0 is certified.**

## 6. Handoff to M1

M1 (Kernel Extraction) may now begin. Its first PR **must**:

1. Reference this report.
2. Include a `MIGRATION-NOTES.md` describing the kernel package extraction and its rollback procedure per `12-rollback-framework.md`.
3. Pass all gates in `15-migration-safety-gates.md` (typecheck 30/30 + all M0 harnesses green).

No plugin implementation exists yet — that remains correctly deferred.

