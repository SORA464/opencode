# M5 — Agent Registry, Manifest, Loader + Profile/Seam/Loop

> Implementations: `packages/kernel/src/agents/agent-registry.ts`, `agent-manifest.ts`, `agent-loader.ts`

- **Registry:** `AgentRuntimeRegistry` — discovery, registration, validation, lifecycle, health, provenance, enable/disable/replacement/quarantine. Authoritative selection via `get(id)` / `list()`.
- **Manifest:** `AgentManifest {id, version, runtimeId, capabilities, dependencies, tools, models, permissions, trustTier}` — validated before activation.
- **Loader:** `AgentLoader` — deterministic dependency resolution (reuses M1 `DependencyGraph`), manifest validation, lifecycle handling, failure isolation (failed → quarantine, not crash), rollback via `list()` ledger.
- **Profile integration:** `profile.agentRuntime` selects runtime via composition data (M4 `Composition` → `AgentRegistry.get`). No hardcoded profile-specific behavior in kernel.
- **Primary-agent seam & loop extraction:** Compatibility adapter keeps existing `session/prompt.ts` loop working; new `AgentRuntime` behind `AgentContract` takes ownership without changing public behavior. Behavioral parity verified via golden masters before cutover.

