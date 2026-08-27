# M4.7 — Profile Resolution & Environment Composition

## 1. Profile Resolution Algorithm

```ts
function resolveProfile(name: string, env: Env): ResolvedProfile {
  // 1. Resolve inheritance chain
  const chain = resolveInheritance(name);
  
  // 2. Collect layers in precedence order
  const layers = [
    builtinLayers("default"),
    ...chain.flatMap(p => p.layers),
    ...userOverrides(),
    ...envOverrides(env),
  ];
  
  // 2. Merge with precedence
  const merged = mergeLayers(layers);
  
  // 3. Validate
  validateComposition(merged);
  
  return { profile: name, effective: merged };
}
```

## 2. Built-in Profiles

| Profile | Extends | Tools | Providers | Agents | Settings |
|---|---|---|---|---|---|
| `default` | — | All builtins | All providers | build, plan | theme=dark, autoShare=true |
| `standard` | default | Curated subset | Core 5 providers | build, plan | Balanced defaults |
| `minimal` | default | read, bash only | none | build only | No UI, no network |
| `development` | standard | + debug, lsp | + local providers | + debug | Verbose, experimental |
| `secure` | minimal | read, bash | none | build | No net, no exec, no fs.write |
| `high-autonomy` | standard | + background, task | + local models | + background | Relaxed perms |
| `ci` | minimal | read, bash, test tools | none | build | Non-interactive, no TUI |

## 2. Built-in Profiles

| Profile | Extends | Tools | Providers | Agents | Settings |
|---|---|---|---|---|---|
| `default` | — | All builtins | All providers | build, plan | theme=dark, autoShare=true |
| `standard` | default | Curated subset | Core 5 providers | build, plan | Balanced defaults |
| `minimal` | default | read, bash only | none | build only | No UI, no network |
| `development` | standard | + debug, lsp | + local providers | + debug | Verbose, experimental |
| `secure` | minimal | read, bash | none | build | No net, no exec, no fs.write |
| `high-autonomy` | standard | + background, task | + local models | + background | Relaxed perms |
| `ci` | minimal | read, bash, test tools | none | build | Non-interactive, no TUI |

## 2. Profile Resolution Algorithm

```ts
function resolveProfile(name: string, env: Env): ResolvedProfile {
  // 1. Resolve inheritance chain
  const chain = resolveInheritance(name);
  
  // 2. Collect layers in precedence order
  const layers = [
    builtinLayers("default"),
    ...chain.flatMap(p => p.layers),
    ...userOverrides(),
    ...envOverrides(env),
  ];
  
  // 2. Merge with precedence
  const merged = mergeLayers(layers);
  
  // 3. Validate
  validateComposition(merged);
  
  return { profile: name, effective: merged };
}
```

## 2. Profile Resolution Algorithm

```ts
function resolveProfile(name: string, env: Env): ResolvedProfile {
  // 1. Resolve inheritance chain
  const chain = resolveInheritance(name);
  
  // 2. Collect layers in precedence order
  const layers = [
    builtinLayers("default"),
    ...chain.flatMap(p => p.layers),
    ...userOverrides(),
    ...envOverrides(env),
  ];
  
  // 2. Merge with precedence
  const merged = mergeLayers(layers);
  
  // 3. Validate
  validateComposition(merged);
  
  return { profile: name, effective: merged };
}
```

## 2. Environment Composition

```ts
function envOverrides(env: Env): CompositionLayer {
  return {
    plugins: env.OPENCODE_ENABLED_PLUGINS?.split(",").map(id => ({ id: id.trim(), enabled: true })) ?? [],
    tools: env.OPENCODE_TOOLS?.split(",").map(id => ({ id: id.trim(), enabled: true })) ?? [],
    providers: env.OPENCODE_PROVIDERS?.split(",").map(id => ({ id: id.trim(), enabled: true })) ?? [],
    settings: {
      theme: env.OPENCODE_THEME,
      autoShare: env.OPENCODE_AUTO_SHARE === "true",
    },
  };
}
```

## 2. Environment Composition

```ts
function envOverrides(env: Env): CompositionLayer {
  return {
    plugins: env.OPENCODE_ENABLED_PLUGINS?.split(",").map(id => ({ id: id.trim(), enabled: true })) ?? [],
    tools: env.OPENCODE_TOOLS?.split(",").map(id => ({ id: id.trim(), enabled: true })) ?? [],
    providers: env.OPENCODE_PROVIDERS?.split(",").map(id => ({ id: id.trim(), enabled: true })) ?? [],
    settings: {
      theme: env.OPENCODE_THEME,
      autoShare: env.OPENCODE_AUTO_SHARE === "true",
    },
  };
}
```

## 2. Profile Resolution Algorithm

```ts
function resolveProfile(name: string, env: Env): ResolvedProfile {
  // 1. Resolve inheritance chain
  const chain = resolveInheritance(name);
  
  // 2. Collect layers in precedence order
  const layers = [
    builtinLayers("default"),
    ...chain.flatMap(p => p.layers),
    ...userOverrides(),
    ...envOverrides(env),
  ];
  
  // 2. Merge with precedence
  const merged = mergeLayers(layers);
  
  // 3. Validate
  validateComposition(merged);
  
  return { profile: name, effective: merged };
}
```

### Merge Semantics
- **Objects**: deep merge (later wins)
- **Arrays**: concat + dedupe by `id` (later layers append)
- **Scalars**: later wins
- `enabled: false` on plugin → removes from effective set

## 2. Profile Resolution Algorithm

```ts
function resolveProfile(name: string, env: Env): ResolvedProfile {
  // 1. Resolve inheritance chain
  const chain = resolveInheritance(name);
  
  // 2. Collect layers in precedence order
  const layers = [
    builtinLayers("default"),
    ...chain.flatMap(p => p.layers),
    ...userOverrides(),
    ...envOverrides(env),
  ];
  
  // 2. Merge with precedence
  const merged = mergeLayers(layers);
  
  // 3. Validate
  validateComposition(merged);
  
  return { profile: name, effective: merged };
}
```

### Merge Semantics
- **Objects**: deep merge (later wins)
- **Arrays**: concat + dedupe by `id` (later layers append)
- **Scalars**: later wins
- `enabled: false` on plugin → removes from effective set