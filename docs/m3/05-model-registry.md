# M3.5 — Model Registry

> Implementation: `packages/kernel/src/providers/model-registry.ts`

Deterministic, provider-associated, alias-aware, deprecation-aware. `resolve` throws typed `ModelNotFound` / `ModelDeprecated`. Replaces `models.dev` ad-hoc lookup + plugin hook chain with a single registry.

