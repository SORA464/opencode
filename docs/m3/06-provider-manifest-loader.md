# M3.6 — Provider Manifest & Loader

> Implementations: `provider-manifest.ts` (validate id/providerId/plugin) and `provider-loader.ts` (topo-sort, failure isolation).

Manifest analogous to tool manifests: `id, version, providerId, supportedModels, capabilities, dependencies, permissions, transport, credential, plugin`. Loader validates before activation; malformed plugins never become ACTIVE; broken plugins quarantined, not crashing core.

