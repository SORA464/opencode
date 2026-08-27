# M4.22 — Tool Composition Integration

## 1. Tool Registry as Composition Source

Kernel's `ToolRegistry` (M2) becomes a composition source:

```ts
// In composition manifest:
{ "tools": { "enabled": ["read", "write", "bash", "custom-tool"] } }
```

Registry resolves:
- `enabled` list filters `ToolRegistry.discovery()`
- `disabled` via `enabled: false` in manifest
- Dependencies resolved via `DependencyGraph`

## 2. Tool Composition in Profile

```json
{
  "tools": {
    "enabled": ["read", "write", "bash", "glob", "grep", "my-custom-tool"]
  }
}
```

- Enabled list filters `ToolRegistry.discovery()`
- Disabled via `enabled: false` in manifest
- Dependencies resolved via `DependencyGraph`

## 2. Tool Composition in Profile

```json
{
  "tools": {
    "enabled": ["read", "write", "bash", "glob", "grep", "my-custom-tool"]
  }
}
```

- Enabled list filters `ToolRegistry.discovery()`
- Disabled via `enabled: false` in manifest
- Dependencies resolved via `DependencyGraph`