# M3.17 — Model Resolution

> Implementation: `model-resolution.ts`

Supports explicit provider/model, aliases, default model, capability-based selection, unavailable/deprecated handling. `resolveModel(registry, id, {aliases, defaultModel})` is deterministic; unknown → typed error. Replaces ad-hoc branching in `provider.ts` custom loaders.

