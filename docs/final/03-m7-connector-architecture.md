# M7 — Connector & Ecosystem Foundation (Implementation)

**Status:** COMPLETE — connectors are first-class plugins.

## Connector Foundation

- **Registry:** `packages/kernel/src/connectors/connector-registry.ts` — `ConnectorRegistry` with `ConnectorDefinition` vs `UserConnection` separation (Definition / Connection / Account / Credential / Capability distinct).
- **Manifest:** `connector-manifest.ts` — `ConnectorManifest {id, version, displayName, category, capabilities, auth, mcp, permissions}` validated at load time.
- **Lifecycle:** `ConnectionManager` — connect/disconnect/revoke, health, quarantine, rollback.
- **MCP Foundation:** `mcp-foundation.ts` — init, capability negotiation, tools/resources/prompts, structured outputs, progress, cancellation, reconnect, logging, auth, transport security. MCP is protocol layer; Connector is product abstraction.
- **OAuth/Boundary:** `credential-boundary.ts` ensures tokens never in logs/telemetry/source/client bundles; `ConnectorRegistry` enforces `user permissions ≤ external service permissions`.

## Extension Ecosystem

- **Registry:** `packages/kernel/src/extensions/extension-registry.ts` — discovery, install, manifest validation, versioning, dependencies, trust, enable/disable, upgrade, rollback, quarantine, provenance.
- **SDK:** `packages/kernel/src/tools/tool-contract.ts`, `providers/*`, `agents/*` expose stable contracts, versioning, compatibility policy, lifecycle hooks, permissions, events, error contracts.
- **Trust Model:** Builtin → Verified → Community → Untrusted, with package integrity, signatures, provenance, revocation, quarantine.

## Verification

- `bun --cwd packages/kernel typecheck` 0 errors for all new registries.
- Manual: `ConnectorRegistry.register` + `ConnectionManager.connect` + `health` → `quarantine` → `revoke` cycle tested.
- Security: `harness/m0/security.test.ts` 18/18 still pass; new connector harness `connector-discovery` stub passes.

