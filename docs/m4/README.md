# M4 — Composition-as-Data

> **Status:** RESEARCH / DESIGN — frozen baseline `f7ff815fc` + M1/M2/M3 certified. M4 implementation starts after M3 certification.

## Documents

| # | Document | Description |
|---|---|---|
| 01 | `01-composition-audit.md` | Complete inventory of current composition mechanisms |
| 02 | `02-target-composition-model.md` | Canonical composition schema + plugin/profile manifests |
| 03 | `03-profile-system.md` | Profile manifests, inheritance, resolution |
| 04 | `04-layered-composition.md` | 4-layer model, merge semantics, conflict detection |
| 05 | `05-override-conflict.md` | Override operations + conflict taxonomy |
| 06 | `06-dependency-resolution.md` | Kahn's algorithm integration with M1 graph |
| 07 | `07-validation-deterministic-startup.md` | Validation checklist + deterministic boot |
| 07 | `07-effective-composition.md` | Effective composition output + provenance API |
| 08 | `08-activation-security.md` | Activation policy, SEP floor, trust tiers |
| 09 | `09-profile-resolution.md` | Profile inheritance + env overlays |
| 10 | `10-user-composition-inspection.md` | Inspection API, provenance, diff, explain |
| 11 | `11-composition-diff-lock.md` | Diff API, lock file format, signature prep |
| 12 | `12-atomic-activation-rollback.md` | Atomic activation transaction + rollback framework |
| 13 | `13-legacy-migration.md` | V1/V2 migration strategy + order |
| 14 | `15-tool-composition.md` | Tool registry as composition source |
| 15 | `15-security-hardening.md` | SEP floor, trust tiers, permission enforcement |
| 16 | `16-performance-report.md` | Baselines + projected overhead + scale tests |
| 17 | `17-legacy-migration.md` | V1/V2 migration map + order |
| 18 | `17-provider-composition.md` | Provider registry + model registry in composition |
| 18 | `18-security-hardening.md` | SEP floor, trust tiers, supply chain |
| 19 | `18-event-composition.md` | Event registry as composition source |
| 19 | `19-security-hardening.md` | SEP floor, trust tiers, permission enforcement |
| 20 | `20-migration-strategy.md` | Migration order + V1/V2 migration |
| 21 | `20-migration-strategy.md` | Migration pattern + order |
| 22 | `22-security-hardening.md` | SEP floor, trust tiers, permission enforcement |
| 23 | `23-performance-report.md` | Baselines + projected overhead + scale tests |
| 24 | `24-testing.md` | Unit/integration/compatibility/regression/security/performance |
| 25 | `25-scale-testing.md` | Scale test results + projected overhead |
| 26 | `26-migration-strategy.md` | Phased migration plan + rollback |
| 27 | `27-deletion-rule.md` | Deletion policy + checklist |
| 28 | `28-m4-success-state.md` | Success criteria + target architecture |
| 29 | `29-final-certification.md` | M4 certification decision |

## Quick Start

```bash
# Regenerate baseline inventory
bun harness/m0/inventory.ts > /tmp/new.json && diff docs/m0/inventory.json /tmp/new.json

# Run golden master
bun test harness/m0/golden-master.test.ts

# Full typecheck
bun turbo typecheck

# Build + smoke test
bun --cwd packages/opencode build --single
./packages/opencode/dist/opencode-windows-x64/bin/opencode.exe --version
```

## Verification Checklist

- [x] Baseline inventory committed (`docs/m0/inventory.json`)
- [x] Runtime topology documented (`02-runtime-topology.md`)
- [x] Dependency graph frozen (`03-dependency-graph.md`)
- [x] Contract inventory complete (`04-contract-inventory.md`)
- [x] Golden master suite defined (`05-golden-master-suite.md`)
- [x] Compatibility harness spec'd (`06-compatibility-harness.md`)
- [x] Agent runtime harness spec'd (`07-agent-runtime-harness.md`)
- [x] Tool harness spec'd (`08-toolchain-harness.md`)
- [x] Provider harness spec'd (`09-provider-harness.md`)
- [x] Performance baseline recorded (`10-performance-baseline.md`)
- [x] Security baseline documented (`11-security-baseline.md`)
- [x] Rollback framework defined (`12-rollback-framework.md`)
- [x] Change detection system (`13-change-detection.md`)
- [x] Regression framework (`14-regression-framework.md`)
- [x] Migration safety gates (`15-migration-safety-gates.md`)
- [x] M0 certification report (`16-M0-certification-report.md`)
- [ ] Composition audit complete
- [ ] Target model designed
- [ ] Profile system designed
- [ ] Layered composition engine designed
- [ ] Override semantics + conflict detection designed
- [ ] Dependency resolution integrated
- [ ] Validation + deterministic startup designed
- [ ] Effective composition output + provenance designed
- [ ] Activation policy + security floor designed
- [ ] Profile resolution + env composition designed
- [ ] User composition + inspection API designed
- [ ] Composition diff + locking designed
- [ ] Integrity/signature prep + hot-change boundary designed
- [ ] Atomic activation + rollback designed
- [ ] Legacy migration plan (V1/V2, tool/provider) documented
- [ ] Security hardening + performance + scale testing planned
- [ ] Regression gates defined
- [ ] Migration strategy + deletion rules defined
- [ ] M4 success state defined
- [ ] M4 certification criteria defined

## Verification

```bash
# Regenerate inventory
bun harness/m0/inventory.ts > /tmp/new.json && diff docs/m0/inventory.json /tmp/new.json

# Run golden master
bun test harness/m0/golden-master.test.ts

# Typecheck
bun turbo typecheck

# Run M0 harnesses
bun test harness/m0/golden-master.test.ts
bun test harness/m0/compatibility.test.ts
# ... etc
```

## Status

- [x] M0: CERTIFIED (`d6e796b9e`)
- [x] M1: CERTIFIED (`8499ca537`)
- [x] M2: CERTIFIED (`d35af32c9`)
- [x] M3: CERTIFIED (`7a546a04a`)
- [ ] M4: IN PROGRESS (audit complete, design in progress)
- [ ] M5: NOT STARTED
- [ ] M6: NOT STARTED
- [ ] M7: NOT STARTED