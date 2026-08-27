# M3.0 — Provider/LLM Audit (Complete Inventory)

> Baseline: M2 `d35af32c9`. No provider code modified in this audit phase.

## 1. Providers & Adapters

| Provider | Package | Adapter file | Auth | Models |
|---|---|---|---|---|
| anthropic | `@ai-sdk/anthropic` | `core/src/provider.ts: custom(anthropic)` | `ANTHROPIC_API_KEY` | claude-* |
| openai | `@ai-sdk/openai` | `provider.ts: BUNDLED` | `OPENAI_API_KEY` | gpt-* |
| google | `@ai-sdk/google` | `provider.ts` | `GOOGLE_*` | gemini-* |
| google-vertex | `@ai-sdk/google-vertex` | `provider.ts` | GCP creds | gemini via Vertex |
| azure | `@ai-sdk/azure` | `provider.ts: custom(azure)` | `AZURE_*` | gpt via Azure |
| amazon-bedrock | `@ai-sdk/amazon-bedrock` | `provider.ts` | AWS credential chain | bedrock models |
| mistral | `@ai-sdk/mistral` | `provider.ts` | `MISTRAL_API_KEY` | mistral-* |
| groq | `@ai-sdk/groq` | `provider.ts` | `GROQ_API_KEY` | llama-* |
| xai | `@ai-sdk/xai` | `provider.ts` | `XAI_API_KEY` | grok-* |
| deepinfra | `@ai-sdk/deepinfra` | `provider.ts` | `DEEPINFRA_API_KEY` | various |
| perplexity | `@ai-sdk/perplexity` | `provider.ts` | `PERPLEXITY_API_KEY` | sonar-* |
| togetherai | `@ai-sdk/togetherai` | `provider.ts` | `TOGETHER_API_KEY` | various |
| cohere | `@ai-sdk/cohere` | `provider.ts` | `COHERE_API_KEY` | command-* |
| cerebras | `@ai-sdk/cerebras` | `provider.ts` | `CEREBRAS_API_KEY` | llama |
| vercel | `@ai-sdk/vercel` | `provider.ts` | `VERCEL_*` | v0 |
| alibaba | `@ai-sdk/alibaba` | `provider.ts` | `DASHSCOPE_API_KEY` | qwen-* |
| openai-compatible | `@ai-sdk/openai-compatible` | `provider.ts: custom(openai-compatible)` | `OPENAI_COMPATIBLE_API_KEY` | any OpenAI API |
| openrouter | `@openrouter/ai-sdk-provider` | `provider.ts: openrouter` | `OPENROUTER_API_KEY` | 200+ via OpenRouter |
| github-copilot | `core/src/github-copilot/*` | `copilot-provider.ts` (OpenAI-compatible wrapper) | Copilot OAuth | gpt-4o, claude via Copilot |
| venice | `venice-ai-sdk-provider` | `provider.ts` | `VENICE_API_KEY` | venice models |
| gitlab | `gitlab-ai-provider` | `provider.ts` | `GITLAB_*` | gitlab duo |
| opencode (free-tier) | `core/src/plugin/provider/opencode.ts` | custom | `OPENCODE_AUTH_CONTENT` | via opencode gateway |
| Custom `model.api.npm` | `Npm.add()` + dynamic import `create*` | `provider.ts: resolveSDK` | per-provider env | any npm provider |

## 2. Model Registry & Metadata

- **Source:** `https://models.opencode.ai/api.json` → `models-dev.ts` cached to `~/.cache/opencode/models.json` (5-min TTL, Flock locked, hash-suffixed if custom URL). Build-time snapshot `OPENCODE_MODELS_DEV`.
- **Shape:** `Provider {api?, name, env[], id, npm?, models{ cost/tiers, limits, modalities, reasoning_options, interleaved}}`
- **Assembly order:** models.dev catalog → `provider.models` plugin hook → config `provider{}` → env-key detection → auth.json → `auth.loader` plugins → custom loaders → config re-merge → gitlab discovery → filtering (enabled/disabled, status, variants).
- **Hooks touching providers:** `provider.models`, `auth.loader`, `experimental.provider.small_model`, `config`.

## 3. Execution Path (traced)

```
User prompt
→ agent (session/prompt.ts)
→ model selection (provider/provider.ts ModelRegistry)
→ provider adapter (BUNDLED_PROVIDERS map, lazy dynamic import)
→ request builder (provider-specific: anthropic beta headers, azure resourceName, bedrock region, etc.)
→ transport ( @ai-sdk/* fetch, streaming via StreamChunk)
→ response parser (stream parser per provider)
→ tool-call adapter (provider-specific format → canonical ToolCall)
→ reasoning adapter (reasoning streams)
→ agent continuation (tool results → next model request)
→ final stream → session log → SSE to client
```

## 4. Capability Declarations (per model)

Via `models.dev` `models` entries: `modalities`, `reasoning_options`, `interleaved`, `experimental.modes`, `limits.context`, cost tiers. No explicit capability matrix for tool-calling/streaming/structured-output — inferred optimistically (gap).

## 5. Hardcoded Assumptions

- 25 bundled loaders hardcoded in `BUNDLED_PROVIDERS` map; adding a provider requires code change.
- Provider-specific branches in `custom()` (anthropic beta headers, opencode free-tier filtering, github-copilot responses-vs-chat, azure resourceName).
- `Npm.add` for custom providers is the only dynamic seam (good).
- Env var handling: `OPENCODE_*` vs provider `env[]` mixed; Flag holds ~30 but tail outside (M0 debt).

## 6. Classification (M3)

| Component | Class |
|---|---|
| Provider contract (identity, capabilities, request/streaming) | **Kernel** |
| Model capability model | **Kernel** |
| Provider/Model registries | **Kernel** |
| Credential boundary (vault, lookup, refresh) | **Kernel (SEP)** |
| Transport (HTTP/streaming/retry/timeout/cancellation) | **Shared service** (kernel-owned, provider-agnostic) |
| Per-provider adapter (25 + custom) | **Plugin** |
| Retail model catalog (models.dev) | **Shared service** feeding registries |
| Provider-specific options | **Plugin** |

All 25 bundled adapters are plugin candidates; transport/credential/capability remain kernel/shared.

