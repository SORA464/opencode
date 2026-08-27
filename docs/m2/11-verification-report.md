# M2.11 — Verification Report

| Harness | Result |
|---|---|
| M0 golden-master `harness/m0/golden-master.test.ts` | 4/4 pass |
| `bun turbo typecheck` (kernel) | 0 errors |
| `bun install` | 2411 installs, no churn |
| Tool harness `harness/m0/toolchain.test.ts` (6-case matrix per tool) | green for migrated families (read/write/edit/glob/grep/bash) |
| Compatibility harness `harness/m0/compatibility.test.ts` (old vs new) | green (shell→bash, read→read) |
| Adversarial: broken tool plugin throws | quarantined, unrelated tool still succeeds |

**M0 protections:** All gates in `docs/m0/15-migration-safety-gates.md` remain green except the expected new `packages/kernel/src/tools/*` files (which are the migration itself). No `packages/opencode/src/tool/*` file was deleted or had its contract changed.

**Rollback validation:** `git revert` of M2 commits restores previous registry; old tool paths still function via compatibility layer.

