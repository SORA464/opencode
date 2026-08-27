# M3.2 — Model Capability Model

> Implementation: `packages/kernel/src/providers/model-capability.ts`

Capabilities are explicit, validated, never inferred optimistically:

```ts
interface ModelCapability {
  toolCalling: boolean
  reasoning: boolean
  streaming: boolean
  structuredOutput: boolean
  images: boolean
  contextSize: number
  modalities: ("text" | "image" | "audio")[]
  protocol: "openai-chat" | "openai-responses" | "anthropic-messages" | "gemini" | "bedrock-converse"
}
```

Runtime queries:

```ts
registry.supports(modelId, "toolCalling") // → boolean
registry.capability(modelId) // → ModelCapability or throw ModelNotFound
```

All 25 providers' models are mapped via `models.dev` metadata plus provider-specific overrides (e.g., gpt-5 heuristic for github-copilot). Unknown model → typed `ModelNotFoundError` (see 04-contract-inventory).

No model is assumed to support a capability unless explicitly declared.

