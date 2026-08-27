# M4.23 — Service Composition Integration

## 1. Service Registry as Composition Source

Kernel `ServiceRegistry` becomes authoritative source for service composition:

```json
{
  "services": {
    "enabled": ["database", "event", "config", "permission", "filesystem", "pty", "ripgrep"],
    "overrides": { "database": { "poolSize": 20 } }
  }
}
```

- Enabled list filters `ServiceRegistry.list()`
- Config overrides applied at registration time
- Dependencies resolved via `DependencyGraph`

## 1. Service Composition Integration

Kernel `ServiceRegistry` becomes authoritative source for service composition:

```json
{
  "services": {
    "enabled": ["database", "event", "config", "permission", "filesystem", "pty", "ripgrep"],
    "overrides": { "database": { "poolSize": 20 } }
  }
}
```

- Enabled list filters `ServiceRegistry.list()`
- Config overrides applied at registration time
- Dependencies resolved via `DependencyGraph`