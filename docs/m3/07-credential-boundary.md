# M3.7 — Credential Boundary

> Implementation: `packages/kernel/src/providers/credential-boundary.ts`

Provider plugins declare `credential.envVars`; kernel looks up `process.env` and `auth.json` via `Credential` vault, never exposing raw keys in logs/telemetry/manifests. `redact` helper and `lookup` with `Redacted` wrappers verified via `harness/m0/security.test.ts`. Env var sprawl (Flag tail) now documented in `03-technical-debt.md:D2` and swept into Flag getters in M0 guardrail.

