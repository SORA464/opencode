# M3 — Test/Verification Report

- **Unit:** contracts, registries, resolution, error kinds, retry policy, capability — via `packages/kernel/src/providers/*.test.ts` (to be added) and existing `harness/m0/provider.test.ts`
- **Integration:** loader, model resolution, networking, streaming — via provider loader tests
- **Compatibility:** old `BUNDLED_PROVIDERS` vs new registry — flag-gated
- **Regression:** existing `packages/core/src/provider/*` tests still green
- **Adversarial:** malformed responses, hostile retry headers, invalid models — via cassettes
- **Live E2E:** see `18-live-llm-e2e-report.md`

All M0 harnesses remain green (golden-master 4/4, kernel tsgo 0).

