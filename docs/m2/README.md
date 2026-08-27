# M2 — Tool System Pluginization

> **Status:** docs + kernel tool framework — M2.6 incremental migration (6 wrappers), no V1 tool deletion. Baseline behavior preserved.

## Contents

| Doc | Deliverable |
|---|---|
| `01-tool-audit.md` | Tool audit report |
| `03-migration-map.md` | Tool migration map |
| `02-tool-contracts.md` | Tool contracts |
| `02-tool-registry.md` | Tool registry |
| `04-tool-manifests.md` | Tool manifests |
| `05-tool-loader.md` | Tool loader |
| `06-migrated-builtins.md` | Migrated built-in tools |
| `07-permission-integration.md` | Permission integration |
| `08-failure-containment.md` | Failure containment |
| `09-compatibility-layer.md` | Compatibility layer |
| `10-hardening-report.md` | Hardening report |
| `11-verification-report.md` | Verification report |
| `12-rollback-report.md` | Rollback report |
| `13-M2-certification-report.md` | M2 certification |

Implementation: `packages/kernel/src/tools/` (7 files + `builtins/`).

## How to verify

```bash
bun --cwd packages/kernel typecheck
bun test harness/m0/golden-master.test.ts
```

M0 gates remain green; M3 may now start.

