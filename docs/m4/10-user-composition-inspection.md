# M4.7 — User Composition & Inspection

## 1. User Composition API

```ts
// User adds/overrides via .opencode/profile.json or OPENCODE_* env
{
  "profile": "standard",
  "layers": [
    { "name": "user", "plugins": [{ "id": "my-tool", "enabled": true }] }
  ],
  "tools": { "enabled": ["read", "write", "custom-tool"] },
  "providers": { "enabled": ["anthropic", "openai"] }
}
```

## 1. User Composition API

```ts
// User adds/overrides via .opencode/profile.json or OPENCODE_* env
{
  "profile": "standard",
  "layers": [
    { "name": "user", "plugins": [{ "id": "my-tool", "enabled": true }] }
  ],
  "tools": { "enabled": ["read", "write", "custom-tool"] },
  "providers": { "enabled": ["anthropic", "openai"] }
}
```

## 1. User Composition API

```ts
// User adds/overrides via .opencode/profile.json or OPENCODE_* env
{
  "profile": "standard",
  "layers": [
    { "name": "user", "plugins": [{ "id": "my-tool", "enabled": true }] }
  ],
  "tools": { "enabled": ["read", "write", "custom-tool"] },
  "providers": { "enabled": ["anthropic", "openai"] }
}
```

## 2. Inspection API

```ts
interface CompositionInspector {
  getEffective(): EffectiveComposition;
  getProvenance(capabilityId: string): ProvenanceEntry;
  getConflicts(): Conflict[];
  getDiff(other: EffectiveComposition): CompositionDiff;
  explain(capabilityId: string): Explanation;
}
```

## 1. Inspection API

```ts
interface CompositionInspector {
  getEffective(): EffectiveComposition;
  getProvenance(capabilityId: string): ProvenanceEntry;
  getConflicts(): Conflict[];
  getDiff(other: EffectiveComposition): CompositionDiff;
  explain(capabilityId: string): Explanation;
}
```

## 1. Inspection API

```ts
interface CompositionInspector {
  getEffective(): EffectiveComposition;
  getProvenance(capabilityId: string): ProvenanceEntry;
  getConflicts(): Conflict[];
  getDiff(other: EffectiveComposition): CompositionDiff;
  explain(capabilityId: string): Explanation;
}
```

## 2. Example Provenance Output

```json
{
  "read": { "source": "default", "plugin": "read@1.0.0", "layer": "default" },
  "bash": { "source": "profile", "plugin": "bash@1.0.0", "layer": "profile" },
  "custom-tool": { "source": "user", "plugin": "my-tool@1.0.0", "layer": "user" }
}
```

## 2. Example Provenance Output

```json
{
  "read": { "source": "default", "plugin": "read@1.0.0", "layer": "default" },
  "bash": { "source": "profile", "plugin": "bash@1.0.0", "layer": "profile" },
  "custom-tool": { "source": "user", "plugin": "my-tool@1.0.0", "layer": "user" }
}
```

## 3. Diff API

```ts
interface CompositionDiff {
  added: Capability[];
  removed: Capability[];
  changed: { id: string; before: Capability; after: Capability }[];
  conflicts: Conflict[];
}
```

## 3. Diff API

```ts
interface CompositionDiff {
  added: Capability[];
  removed: Capability[];
  changed: { id: string; before: Capability; after: Capability }[];
  conflicts: Conflict[];
}
```

## 3. Explain API

```ts
interface Explanation {
  capabilityId: string;
  source: "default" | "profile" | "user" | "overlay";
  plugin: string;
  layer: "default" | "profile" | "user" | "overlay";
  overriddenFrom?: string;
  reason: string;
}
```

## 3. Explain API

```ts
interface Explanation {
  capabilityId: string;
  source: "default" | "profile" | "user" | "overlay";
  plugin: string;
  layer: "default" | "profile" | "user" | "overlay";
  overriddenFrom?: string;
  reason: string;
}
```