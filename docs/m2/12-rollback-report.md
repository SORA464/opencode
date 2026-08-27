# M2.12 — Rollback Report

## Rollback procedure (M2)

**Trigger:** tool harness failure, golden-master drift, or performance regression > tolerance.

**Process:**

1. `git revert <M2 commits>` (tool registry/manifests/loader + builtins) — or flip `OPENCODE_TOOL_REGISTRY_KERNEL=0` flag if added in follow-up.
2. `bun install && bun turbo typecheck` — must be 30/30 (kernel revert) or 0 errors (tool revert).
3. `bun test harness/m0/golden-master.test.ts` — must be 4/4.
4. `curl /global/health` → healthy.
5. Re-run `harness/m0/toolchain.test.ts` on reverted tree — must be green (old V1/V2 paths).

**Validation:** Same as verification report §11. Rollback is successful when all gates that were green before M2 are green again.

**Success criteria:** No DB migration in M2 (none), so RPO 0, RTO < boot time + health poll. Profile lock not yet introduced (M4), so no lock restore needed.

**One-way-door check:** No. M2 is fully reversible because old tool registries (`ApplicationTools`, `Tools.Service`, V1 `tool/registry.ts`) were never deleted — only wrapped.

