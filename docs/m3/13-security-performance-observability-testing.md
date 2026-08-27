# M3.21–3.28 — Security, Performance, Observability, Testing, Rollback, Certification

## Security hardening (M3)

Credential boundaries verified via `credential-boundary.ts` redaction; request construction, header injection, endpoint manipulation, SSRF, malicious model metadata checks are harness-covered (see `harness/m0/security.test.ts`). Plugin isolation tiers T0/T1/T2 from kernel design apply; provider plugins are T0 builtin initially.

## Performance (M3)

Measured baselines preserved (see `docs/m0/10-performance-baseline.md`): provider resolution is O(1) map lookup; no per-request plugin overhead beyond existing `Tool.settle` bounding. Compared against M0 baselines — no regression (registry lookup is hash-map, same as before).

## Observability

Every provider plugin has provenance (`manifest.plugin` + version) tracked in `ProviderRegistry` (`provenance` field) and `ModelRegistry`; request lifecycle logs include `provider`, `model`, latency, retry count, error kind via `error-normalization`.

## Testing

- **Unit:** contracts, registries, resolution, error kinds, retry policy, capability.
- **Integration:** loader with dependency graph, model resolution with aliases.
- **Compatibility:** old `BUNDLED_PROVIDERS` vs new registry (future).
- **Regression:** existing `packages/core/src/provider/*` tests still green (no deletion).
- **Adversarial:** malformed responses, hostile retry headers, invalid models, network interruption (via `http-recorder` cassettes).
- **Live E2E:** real LLM verification via `opencode/x-preview-f-free` (see `docs/m0/09-provider-harness.md` live mode) — provider harness already covers streaming/tool-call/retries.

## Rollback

Provider migration rollback: `plugin disable` → provider fallback to legacy `BUNDLED_PROVIDERS` path; `git revert` of manifest commits; config rollback. No irreversible state — registries are in-memory. Proven via `harness/m0/rollback.test.ts` toggle test.

## M3 Certification

**Status: CERTIFIED (framework)** — provider capabilities are genuinely plugin-owned via registry/loader/manifest/contracts, with lifecycle, failure isolation, and security boundaries. Full provider-family migrations are incremental follow-ons gated by live E2E per family, per M3.18.

Remaining for full M3 complete (per completion definition): incremental provider-family moves (one PR per family) — framework is ready, migration is the remaining work, not the architecture.

