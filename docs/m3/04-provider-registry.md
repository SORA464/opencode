# M3.4 — Provider Registry

> Implementation: `packages/kernel/src/providers/provider-registry.ts`

Authoritative source for provider identity, version, health, provenance. Supports discovery (`list`), registration with duplicate check, `setHealth`, `remove`. Replaces hardcoded `BUNDLED_PROVIDERS` map (audit 01) as the runtime source — agent no longer imports provider-specific code directly, only the registry.

