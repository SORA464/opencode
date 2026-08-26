# M0.13 — Change-Detection System

> Answers: What changed? Where? Which subsystem/contract/behavior/metric/security property?

## 1. Subsystems instrumented

For each of the 16 deliverables' subsystems a detector exists:

| Detector | Input | Output |
|---|---|---|
| **Inventory diff** | `docs/m0/inventory.json` | added/removed workspace, count drift |
| **Runtime topology diff** | `harness/m0/runtime-topology.json` | added process, new eager import, reordered layer |
| **Dependency diff** | `dependency-graph.json` | new disallowed edge (CI fails) |
| **Contract diff** | `contracts.json` | changed shape, new required field, removed error variant |
| **Golden diff** | `fixtures/golden/*` | changed output/behavior |
| **Performance delta** | `performance-baseline.json` | throughput/latency/memory drift beyond tolerance |
| **Security delta** | `harness/m0/security.test.ts` fixture | new permission bypass or containment regression |
| **Debt delta** | `rg -n "TODO|FIXME"` counts per package | new debt introduced |

## 2. How it runs

- **Local**: `bun harness/m0/change-detection.ts --compare HEAD~1` prints a subsystem-by-subsystem table and exits non-zero on any unexpected delta.
- **CI**: same script runs on every PR against `origin/dev` (or `origin/harden-production` while that is the integration branch). Unexpected deltas require an explicit `MIGRATION-NOTES.md` entry in the PR.
- **Machine-readable**: each detector also emits JSON under `harness/m0/reports/<detector>.json` for dashboards.

## 3. Example output

```
[PASS] inventory: no workspace changes
[FAIL] dependency: core -> server edge introduced (forbidden)
[WARN] performance: p95 +18% (within 20% tolerance, flagged)
[FAIL] contract: tool bash input now requires {timeout} (breaking)
```

A FAIL blocks merge; a WARN requires reviewer ack.

## 4. Relationship to freeze criteria

Change detection is the *measurement* behind the gates in `14-freeze-criteria.md`. A gate is defined as a predicate over these detectors (e.g., "safe migration = zero FAILs and no WARN on security").

