# M4.2 — Target Composition Model Design

## 1. Composition Schema (v1)

```json
{
  "$schema": "https://opencode.ai/composition/v1",
  "version": 1,
  "profile": "standard",
  "layers": [
    {
      "layer": "default",
      "plugins": [
        { "id": "read", "version": "1.0.0", "enabled": true },
        { "id": "bash", "version": "1.0.0", "enabled": true }
      ],
      "tools": ["read", "write", "bash"],
      "providers": ["anthropic", "openai"],
      "models": { "default": "anthropic/claude-3-5-sonnet" },
      "agents": { "default": "build" },
      "settings": { "theme": "dark", "autoShare": true }
    }
  ],
  "overrides": {
    "user": {
      "tools": ["custom-tool"]
    }
  },
  "security": {
    "floor": ["fs.write.outside-workspace", "exec.outside-sandbox"],
    "trustTiers": { "builtin": 4, "verified": 3, "community": 2, "inline": 1 }
  }
}
```

## 2. Schema Definition (Effect Schema)

```ts
// Versioned composition schema
const CompositionV1 = Schema.Struct({
  version: Schema.Literal(1),
  profile: Schema.String,
  layers: Schema.Array(LayerV1),
  overrides: Schema.optional(OverridesV1),
  security: SecurityV1,
})

const LayerV1 = Schema.Struct({
  layer: Schema.Literal("default", "profile", "user", "overlay"),
  plugins: Schema.Array(PluginRefV1),
  tools: Schema.optional(Schema.Array(Schema.String)),
  providers: Schema.optional(Schema.Array(Schema.String)),
  models: Schema.optional(ModelSelectionV1),
  agents: Schema.optional(AgentsV1),
  settings: Schema.optional(SettingsV1),
})

const PluginRefV1 = Schema.Struct({
  id: Schema.String,
  version: Schema.String,
  enabled: Schema.optional(Schema.Boolean),
  dependencies: Schema.optional(Schema.Array(Schema.String)),
  config: Schema.optional(Schema.Record(Schema.Unknown)),
})

const ProfileV1 = Schema.Struct({
  name: Schema.String,
  extends: Schema.optional(Schema.String),
  layers: Schema.Array(LayerV1),
})
```

## 3. Plugin Manifest (v1)

```ts
interface PluginManifestV1 {
  id: string;                       // ^[A-Za-z][A-Za-z0-9_-]{0,63}$
  version: string;                  // semver
  description: string;
  type: "tool" | "provider" | "agent" | "ui" | "command" | "hook";
  entry: string;                    // relative path to entry point
  exports: {
    tools?: string[];
    providers?: string[];
    models?: string[];
    commands?: string[];
    hooks?: string[];
    ui?: { slots?: string[]; routes?: string[]; views?: string[] };
  };
  dependencies: PluginDep[];
  permissions: string[];
  capabilities: string[];
  trustTier: "builtin" | "verified" | "community" | "inline";
  minKernelVersion: string;
  security: {
    fsAccess?: "none" | "workspace" | "any";
    netAccess?: "none" | "same-origin" | "any";
    exec?: boolean;
  };
}
```

## 4. Profile Manifest

```ts
interface ProfileManifestV1 {
  name: string;
  extends?: string;              // parent profile name
  layers: LayerRef[];
  settings: Record<string, unknown>;
  security?: {
    trustTierFloor?: "builtin" | "verified" | "community" | "inline";
    customFloor?: string[];
  };
}

interface LayerRef {
  name: string;                    // "default" | "profile" | "user" | "overlay"
  plugins?: PluginRef[];           // override plugins for this layer
  enabled?: boolean;
}
```

## 23. Migration Strategy (M4 Phases)

| Phase | Scope | Gate |
|---|---|---|
| M4.1 | Composition Audit (this doc) | M0 gates |
| M4.2 | Schema + Kernel Integration | M0 + M1 |
| M4.1 | Schema + Kernel Integration | M0 + M1 |
| M4.2 | Profile System + Layer Engine | M4.1 |
| M4.3 | Override Engine + Conflict Detection | M4.2 |
| M4.3 | Dependency Resolution (M1 graph) | M4.2 |
| M4.5 | Validation + Deterministic Startup | M4.3 |
| M4.6 | Effective Output + Provenance | M4.5 |
| M4.6 | Activation Policy + Security Floor | M4.5 |
| M4.7 | Profile Resolution + Env Composition | M4.6 |
| M4.7 | User Composition + Inspection API | M4.6 |
| M4.8 | Diff + Lock + Integrity Prep | M4.7 |
| M4.9 | Atomic Activation + Rollback | M4.7 |
| M4.9 | Legacy Migration (V1/V2, Tool/Provider) | M4.7 |
| M4.10 | Security/Perf/Scale Tests | M4.9 |
| M4.10 | M4 Certification | All gates green |