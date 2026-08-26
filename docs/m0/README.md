# M0 — Foundation Safety Net

> **Status:** docs only — frozen baseline `f7ff815fc` unchanged architecturally. This directory is the protection system that makes the Everything-Is-A-Plugin migration safe.

## Contents

| Doc | Deliverable | Purpose |
|---|---|---|
| `01-baseline-inventory.md` + `inventory.json` | Baseline inventory | frozen package/module/count datum |
| `02-runtime-topology.md` | Runtime topology map | process model + startup sequence |
| `03-dependency-graph.md` | Dependency graph | allowed/forbidden edges |
| `04-contract-inventory.md` | Contract inventory | API/tool/event/service/provider contracts |
| `05-golden-master-suite.md` | Golden-master suite | behavior snapshots |
| `06-compatibility-harness.md` | Compatibility harness | current vs future comparator |
| `07-agent-runtime-harness.md` | Agent runtime harness | planning/retry/cancellation scenarios |
| `08-toolchain-harness.md` | Tool harness | per-tool 6-case matrix |
| `09-provider-harness.md` | Provider harness | request/streaming/retry cassettes |
| `10-performance-baseline.md` | Performance baseline | throughput/latency/memory fixtures |
| `11-security-baseline.md` | Security baseline | auth/containment/credential expectations |
| `12-rollback-framework.md` | Rollback framework | per-phase template + toggle harness |
| `13-change-detection.md` | Change-detection framework | subsystem-by-subsystem diff system |
| `14-regression-framework.md` | Regression framework | CI wiring for all harnesses |
| `15-migration-safety-gates.md` | Migration safety gates | objective freeze criteria |
| `16-M0-certification-report.md` | M0 certification report | this phase's gate verdict |

Harness implementations (executable subset):

- `harness/m0/golden-master.test.ts` — reference implementation (green)
- `harness/m0/inventory.ts` — regenerates `inventory.json` / `dependency-graph.json`

Companion frozen-bag docs: `../blueprint/README.md` (blueprint, 14 docs, 1103 lines), `../../BASELINE.md`, `../../HARDENING.md`, `../../CERTIFICATION.md`.

## How to use

```bash
# Regenerate and compare baseline (should be zero drift on frozen baseline)
bun harness/m0/inventory.ts > /tmp/new.json && diff docs/m0/inventory.json /tmp/new.json

# Run the reference golden-master harness
bun test harness/m0/golden-master.test.ts

# Full M0 gate check (typecheck + harnesses)
bun turbo typecheck && bun test harness/m0/golden-master.test.ts
```

M1 may start only after `16-M0-certification-report.md` marks all gates green.

