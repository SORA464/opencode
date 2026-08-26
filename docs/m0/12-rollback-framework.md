# M0.12 — Rollback Framework

> One-page procedure per future migration. Every migration PR must fill the template below.

## 1. Template (copy for each phase M1–M7)

```md
### Rollback: <phase name> (e.g., M4 composition-as-data)

**Trigger:** which golden/master or harness failure, or which SLO breach, triggers rollback.
**Scope:** which commits to revert (`git revert <range>` or flag flip).
**Process:**
1. Flip flag `OPENCODE_<PHASE>_ENABLED=0` (old path retained one release) OR `git revert` the phase commits.
2. Re-run `harness/m0/golden-master.test.ts` and `harness/m0/compatibility.test.ts -- --live` if provider-related.
3. Verify health: `curl /global/health` → healthy, `bun turbo typecheck` 30/30, `bun test` core green.
**Validation:** golden diff empty, performance baseline within tolerance, security battery 18/18.
**Success criteria:** same checks that gated the phase now pass on the rolled-back tree.
**One-way-door check:** no DB migration in this phase? If yes, include `drizzle-kit down` step and data-loss disclaimer (none of M1–M4 have migrations by design).
```

## 2. Global principles

- **No phase is a one-way door** until its flag-retention release has shipped *and* its compat layer is deleted in a *separate* phase. Design enforces this by keeping old paths behind flags for exactly one release (blueprint 09).
- **Durable state never depends on plugin code**: session log is the only durability contract; plugins may add event variants via declaration merging but never own the store. Therefore bundle swap mid-session is recoverable via quiesce barrier (kernel design 06 §6).
- **Profile lock rollback**: `profile.lock` (resolved bundle versions + hashes) is versioned; `opencode profile restore --lock <prev>` restores prior composition.

## 3. Pre-staged rollback harness

`harness/m0/rollback.test.ts` exercises the template synthetically: for each phase flag, it flips the flag, asserts old path still boots, then flips back and asserts new path boots. Fails CI if any phase cannot be toggled.

## 4. RPO/RTO for SaaS tier (when hosted)

Not applicable to the local product; for the future hosted tier the framework records RPO/RTO per phase (e.g., M4 composition failure: RPO 0 — no durable writes in composition layer; RTO < boot time + health poll).

