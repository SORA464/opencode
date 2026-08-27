# M3 — Deprecation Report

Legacy provider paths remaining:

| Legacy | Replacement | Migration status | Consumers | Removal criteria | Target |
|---|---|---|---|---|---|
| `BUNDLED_PROVIDERS` hardcoded map | `ProviderRegistry` + manifests | Framework complete, 0 families migrated (intentional per M3.18 incremental rule) | `provider/provider.ts` | Parity proven per family (tests+live E2E+streaming/cancellation/retry/perf/security) | M3 follow-on PRs, one per family |
| Direct `Npm.add` for custom providers | `ProviderLoader` with `model.api.npm` manifest | Spec complete | `provider/provider.ts: resolveSDK` | Same as above | M3 follow-on |
| Env-var direct reads outside Flag | `CredentialBoundary` | Spec complete | `provider.ts` custom loaders | Flag sweep complete | M0 guardrail |

No legacy path deleted in M3 — correct per "no deletion until parity proven."

