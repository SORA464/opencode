# M4.22 — Provider Composition Integration

## 1. Provider Registry as Composition Source

Kernel's `ProviderRegistry` + `ModelRegistry` become composition sources:

```json
{
  "providers": {
    "enabled": ["anthropic", "openai", "google", "my-custom-provider"]
  },
  "models": {
    "default": "anthropic/claude-3-5-sonnet",
    "overrides": { "my-model": { "provider": "custom", "modelId": "custom-v1" } }
  }
}
```

## 1. Provider Composition Integration

Kernel's `ProviderRegistry` + `ModelRegistry` become composition sources:

```json
{
  "providers": {
    "enabled": ["anthropic", "openai", "google", "my-custom-provider"]
  },
  "models": {
    "default": "anthropic/claude-3-5-sonnet",
    "overrides": { "my-model": { "provider": "custom", "modelId": "custom-v1" } }
  }
}
```

## 2. Provider Composition in Profile

```json
{
  "providers": {
    "enabled": ["anthropic", "openai", "google", "my-custom-provider"]
  },
  "models": {
    "default": "anthropic/claude-3-5-sonnet",
    "overrides": { "my-model": { "provider": "custom", "modelId": "custom-v1" } }
  }
}
```

- Enabled list filters `ProviderRegistry.list()`
- Model resolution via `ModelRegistry.resolve()`
- Provider capabilities queried via `ProviderRegistry.get()`

## 2. Provider Composition in Profile

```json
{
  "providers": {
    "enabled": ["anthropic", "openai", "google", "my-custom-provider"]
  },
  "models": {
    "default": "anthropic/claude-3-5-sonnet",
    "overrides": { "my-model": { "provider": "custom", "modelId": "custom-v1" } }
  }
}
```

- Enabled list filters `ProviderRegistry.list()`
- Model resolution via `ModelRegistry.resolve()`
- Provider capabilities queried via `ProviderRegistry.get()`