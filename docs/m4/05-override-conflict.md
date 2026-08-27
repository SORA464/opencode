# M4.5 — Override Semantics & Conflict Detection

## 1. Override Operations

| Operation | Semantics |
|---|---|
| `add` | Insert new row (fail if id exists) |
| `replace` | Replace existing row (match by id) |
| `remove` | Remove row by id |
| `disable` | Set `enabled: false` (excludes from effective) |
| `enable` | Set `enabled: true` (re-enable) |
| `patch` | Deep merge fields into existing row |

## 2. Override Syntax (in profile/user/overlay)

```json
{
  "plugins": [
    { "op": "add", "id": "my-tool", "version": "1.0.0", "plugin": "./my-tool.ts" },
    { "op": "replace", "id": "read", "version": "2.0.0" },
    { "op": "disable", "id": "shell" },
    { "op": "patch", "id": "bash", "config": { "timeout": 30000 } }
  ]
}
```

## 2. Conflict Types

| Conflict | Detection | Resolution |
|---|---|---|
| Duplicate plugin ID | Same `id` in multiple layers | Last layer wins (warn) |
| Incompatible versions | Same plugin, different `version` | Fail fast (config error) |
| Conflicting services | Two plugins provide same service key | Fail fast |
| Conflicting tools | Same tool `id` | Last layer wins (warn) |
| Conflicting providers | Same provider `id` | Last layer wins (warn) |
| Conflicting routes | Same HTTP route pattern | Last layer wins (warn) |
| Conflicting permissions | Same capability, different grant | Deny-by-default (fail) |

## 3. Conflict Detection

```ts
function detectConflicts(layers: CompositionLayer[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Duplicate plugin IDs
  const pluginIds = new Map<string, { layer: string; index: number }[]>();
  for (const [i, layer] of layers.entries()) {
    for (const p of layer.plugins) {
      const arr = pluginIds.get(p.id) ?? [];
      arr.push({ layer: `layer-${i}`, index });
      pluginIds.set(p.id, arr);
    }
  }
  for (const [id, occurrences] of pluginIds) {
    if (occurrences.length > 1) {
      conflicts.push({ type: "duplicate-plugin", id, occurrences });
    }
  }
  
  // Conflicting services/tools/providers
  // ... similar logic for services, tools, providers, routes
  
  return conflicts;
}
```

## Conflict Resolution Rules

| Conflict | Resolution |
|---|---|
| Duplicate plugin ID | Last layer wins; warn |
| Version mismatch | Fail fast (config error) |
| Conflicting service keys | Fail fast |
| Conflicting tool IDs | Last layer wins (warn) |
| Conflicting provider IDs | Last layer wins (warn) |
| Conflicting routes | Last layer wins (warn) |
| Conflicting permissions | Deny-by-default (fail) |