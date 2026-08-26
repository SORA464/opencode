# M0.15 — Migration Safety Gates (Freeze Criteria)

> Objective gates: no subjective approvals. Every gate is a predicate over harnesses/detectors.

## 1. Safe vs unsafe migration

| Outcome | Definition |
|---|---|
| **Safe migration** | zero FAILs across: typecheck 30/30, golden-master diff, compatibility diff (except approved golden updates), dependency diff, contract diff, security battery 18/18, performance within tolerance, rollback toggle green. Change-detection shows only WARNs explicitly acked in PR's `MIGRATION-NOTES.md`. |
| **Unsafe migration** | any FAIL, or any WARN on security/persistence, or any new debt of risk High without an issue link. |

## 2. Acceptable vs unacceptable regression

| Regression | Acceptable | Unacceptable |
|---|---|---|
| New required field in wire contract | never (breaking) | always |
| New optional field / new event variant | yes, with version bump + projector | — |
| p95 +10% on health endpoint | yes, within 20% tolerance and documented | >20% or p99 >60% |
| New `TODO` of risk High | never | always |
| New disallowed dependency edge | never | always |
| Golden diff with reviewer-approved fixture update | yes | without approval |

## 3. Gate table (per-PR)

| Gate | Predicate | Blocker if red |
|---|---|---|
| Typecheck | `bun turbo typecheck` 30/30 | yes |
| Golden master | `harness/m0/golden-master.test.ts` green | yes |
| Compatibility | `harness/m0/compatibility.test.ts` green | yes |
| Agent runtime | `harness/m0/agent-runtime.test.ts` green (cassette) | yes |
| Toolchain | `harness/m0/toolchain.test.ts` green | yes |
| Provider | `harness/m0/provider.test.ts` green (cassette) | yes |
| Security | `harness/m0/security.test.ts` 18/18 | yes — launch blocker |
| Performance | within tolerance vs `performance-baseline.json` | yes if > tolerance |
| Change detection | zero FAILs | yes |
| Rollback toggle | `harness/m0/rollback.test.ts` green | yes |

All gates must be green before a migration PR merges. Nightly live gates (`--live` suites) are informational for PRs, blocking for release branches.

## 4. Freeze criteria for M0 certification

M0 is certified when:

- This document set is committed and pushed.
- All 9 harnesses above exist (at least as spec + one executable reference implementation: golden-master) and are referenced in CI workflow `m0.yml`.
- The baseline inventory JSONs are committed and diff tooling is runnable.
- No architectural migration has occurred (verified via `git diff f7ff815fc..HEAD -- packages` contains only docs/harness, no `packages/*/src` moves).

## 5. How this gates M1

M1 (Kernel Extraction) may start only after this document's M0 certification report (16) marks all gates green. M1's first PR must include its own `MIGRATION-NOTES.md` referencing this gate table.

