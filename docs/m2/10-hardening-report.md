# M2.10 — Hardening Report

## Security

- Tool permission names preserved; SEP floor deny-by-default for sensitive caps.
- Filesystem boundaries verified via toolchain harness (lexical + realPath, 400 not 500).
- No new privileged surface: kernel `permission.ts` is the only enforcement point; CI grep `permission/internal` outside kernel must be zero (enforced in `15-migration-safety-gates.md`).

## Reliability

- Dependency graph cycle detection prevents deadlock at load time.
- Failure containment quarantine ensures one broken tool does not take down registry.
- Tool loader failure isolation: one manifest failure does not abort siblings (tested).

## Performance

- Tool registry is hash-map O(1) + topological sort O(N+E) at load time only; runtime lookup is map access (same as before).
- No per-tool-call overhead beyond existing `Tool.settle` bounding.

## Maintainability

- Canonical contract in one file (`tool-contract.ts`) with version constant `KERNEL_TOOL_API_VERSION=1`.
- Manifests are declarative and validated at load time (no code for trivial tools).

## Observability

- Registry `list()` + loader `loaded/failed` ledger provide composition report.
- Quarantine list is inspectable via `FailureContainment.list()`.

No regressions in existing reliability/performance baselines (see `10-performance-baseline.md`).

