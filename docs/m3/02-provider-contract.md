# M3.1 — Provider Contract (Canonical)

> Implementation: `packages/kernel/src/providers/provider-contract.ts`

```ts
interface ProviderIdentity { id: string; version: string; displayName: string }
interface ProviderManifest {
  id: string; version: string; providerId: string;
  supportedModels: string[]; capabilities: ModelCapability[];
  dependencies: string[]; permissions: string[];
  transport: "http" | "websocket"; credential: CredentialRequirement;
}
interface CredentialRequirement { source: "env" | "authFile" | "oauth"; envVars: string[] }
```

Separate concerns: **Provider identity** (who) vs **Model identity** (which model string) vs **Model capability** (what it can do) vs **Transport** (http/streaming) vs **Agent semantics** (how core uses it). Contract validates before activation; malformed plugins never become ACTIVE.

Provider contract covers: identity, version, supported models, model metadata, capabilities, auth requirements, credential source, request generation, streaming, tool calling, reasoning, structured output, usage reporting, error normalization, retry/timeout/cancellation, health/availability, rate-limit info, provider-specific options (isolated under `options` key).

