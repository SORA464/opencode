# M3.8 — Transport Boundary

> Implementation: `transport-boundary.ts` (`fetchWithRetry` with timeout + AbortSignal).

Generic HTTP/streaming infra (retries, timeout, cancellation, connection reuse, backoff, rate-limit handling) is now shared, not duplicated per provider. Provider-specific behavior (headers, URL construction) stays plugin-owned.

