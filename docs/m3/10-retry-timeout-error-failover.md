# M3.13–3.16 — Retry, Timeout, Error, Failover

> Implementations: `retry-system.ts`, `timeout-cancellation.ts`, `error-normalization.ts`, `failover.ts`

- **Retry:** `RetryPolicy {maxAttempts, budgetMs, backoffMs}`, `isRetryable` predicate, `DEFAULT_RETRY_POLICY` (3 attempts, 24h budget). Hostile `retry-after` capped, budget prevents indefinite sleep.
- **Timeout/Cancellation:** `TimeoutConfig` (connect/request/stream), `withCancellation` via AbortSignal; every provider op terminable, propagates through session abort and process termination.
- **Error normalization:** `ProviderErrorKind` (13 categories) + `normalize` maps provider errors to canonical kinds with `retryable` flag; core receives predictable categories.
- **Failover:** `FailoverPolicy` with `shouldFailover` predicate; `nextProvider` selects next candidate without duplicating agent/tool state.

Verified via `harness/m0/provider.test.ts` and live outage recovery (cert phase: Service Unavailable → retry → success).

