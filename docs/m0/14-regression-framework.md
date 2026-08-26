# M0.14 — Regression Framework

> How the harnesses above become a CI-enforced regression net.

## 1. Harness inventory (executable)

| Harness | File | Default mode | Live mode |
|---|---|---|---|
| Golden master | `harness/m0/golden-master.test.ts` | cassettes | `--live` (requires auth) |
| Compatibility | `harness/m0/compatibility.test.ts` | flag-off vs flag-on diff | — |
| Agent runtime | `harness/m0/agent-runtime.test.ts` | cassettes | `--live` |
| Toolchain | `harness/m0/toolchain.test.ts` | deterministic repo | — |
| Provider | `harness/m0/provider.test.ts` | cassettes | `--live` + `UPDATE_CASSETTES=1` |
| Security | `harness/m0/security.test.ts` | — | — |
| Performance | `harness/m0/performance-baseline.ts` | — | — |
| Change detection | `harness/m0/change-detection.ts` | — | — |
| Rollback toggle | `harness/m0/rollback.test.ts` | — | — |

All harnesses are `bun test` suites; none require the plugin architecture to exist.

## 2. CI wiring (M0)

- **PR gate** (existing `typecheck.yml` + new `m0.yml`): `bun turbo typecheck` 30/30, `bun test` core green, all M0 harnesses green (cassette mode).
- **Nightly live gate** (new `m0-live.yml`, manual + cron): re-runs agent/provider goldens with `--live` against `opencode/x-preview-f-free`; failures file an issue, not block PRs.

## 3. Coverage prioritization

Critical paths first (startup, auth, sessions, providers, agent runtime, tools, persistence, recovery, streaming) are fully harnessed. Vanity coverage (e.g., marketing site) is explicitly out of scope for M0.

## 4. How to add a new harness

1. Add `harness/m0/<name>.test.ts` with `defineScenario`/`defineContract` helpers.
2. Commit its fixtures under `harness/m0/fixtures/<name>/`.
3. Register it in `harness/m0/change-detection.ts` detector list.
4. Gate in `15-migration-safety-gates.md`.

