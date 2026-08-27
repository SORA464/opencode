# M4.9 — Legacy Migration (V1/V2, Tool/Provider Integration)

## 1. Legacy Composition Roots

| Legacy Root | Location | Migration Target |
|---|---|---|
| CLI commands | `src/index.ts` | `Command` plugin type |
| HTTP API routes | `httpapi/server.ts` | `route` contributions |
| Server composition | `server.ts` + `httpapi/server.ts` | `server` bundle |
| TUI bootstrap | `cli/cmd/tui.ts` | `ui-tui` bundle |
| Desktop bootstrap | `desktop/src/main/*` | `desktop-platform` bundle |
| Tool registration | `opencode/src/tool/registry.ts` | `ToolRegistry` kernel API |
| Provider registration | `provider/provider.ts` | Provider plugins + `ProviderRegistry` |
| Config system | `config.ts` + V1 migration | Config composition layer |

## 2. Migration Strategy (per surface)

| Surface | Strategy |
|---|---|
| **Commands** | `Command` plugin type; migrate CLI commands one-by-one; keep `RunCommand` etc. as built-in until all migrated |
| **HTTP Routes** | Convert `HttpApiBuilder.layer()` to declarative route contributions |
| **Server** | Extract `server.ts` logic into `server` bundle; composition loader wires it |
| **TUI** | `ui-tui` bundle; slot/route contributions replace `TuiThreadCommand` |
| **Desktop** | `desktop-platform` bundle; sidecar logic in `desktop-platform` bundle |
| **Tools** | Migrate V1 tools → V2 → kernel registry (M2 done) |
| **Providers** | Migrate V1 `provider.ts` → provider plugins (M3 done) |
| **Config** | V1→V2 migration complete; config becomes composition source |
| **Plugin Loader** | `PluginLoader` becomes kernel service; config-dir tools become plugins |

## 2. Migration Strategy (per surface)

| Surface | Strategy |
|---|---|
| Commands | `Command` plugin type; migrate CLI commands one-by-one; keep `RunCommand` etc. as built-in until all migrated |
| HTTP Routes | Convert `HttpApiBuilder.layer()` to declarative route contributions |
| Server | Extract `server.ts` logic into `server` bundle; composition loader wires it |
| TUI | `ui-tui` bundle; slot/route contributions replace `TuiThreadCommand` |
| Desktop | `desktop-platform` bundle; sidecar logic in `desktop-platform` bundle |
| Tools | Migrate V1 tools → V2 → kernel registry (M2 done) |
| Providers | Migrate V1 `provider.ts` → provider plugins (M3 done) |
| Config | V1→V2 migration complete; config becomes composition source |
| Plugin Loader | `PluginLoader` becomes kernel service; config-dir tools become plugins |

## 2. Migration Strategy (per surface)

| Surface | Strategy |
|---|---|
| Commands | `Command` plugin type; migrate CLI commands one-by-one; keep `RunCommand` etc. as built-in until all migrated |
| HTTP Routes | Convert `HttpApiBuilder.layer()` to declarative route contributions |
| Server | Extract `server.ts` logic into `server` bundle; composition loader wires it |
| TUI | `ui-tui` bundle; slot/route contributions replace `TuiThreadCommand` |
| Desktop | `desktop-platform` bundle; sidecar logic in `desktop-platform` bundle |
| Tools | Migrate V1 tools → V2 → kernel registry (M2 done) |
| Providers | Migrate V1 `provider.ts` → provider plugins (M3 done) |
| Config | V1→V2 migration complete; config becomes composition source |
| Plugin Loader | `PluginLoader` becomes kernel service; config-dir tools become plugins |

## 2. Migration Strategy (per surface)

| Surface | Strategy |
|---|---|
| Commands | `Command` plugin type; migrate CLI commands one-by-one; keep `RunCommand` etc. as built-in until all migrated |
| HTTP Routes | Convert `HttpApiBuilder.layer()` to declarative route contributions |
| Server | Extract `server.ts` logic into `server` bundle; composition loader wires it |
| TUI | `ui-tui` bundle; slot/route contributions replace `TuiThreadCommand` |
| Desktop | `desktop-platform` bundle; sidecar logic in `desktop-platform` bundle |
| Tools | Migrate V1 tools → V2 → kernel registry (M2 done) |
| Providers | Migrate V1 `provider.ts` → provider plugins (M3 done) |
| Config | V1→V2 migration complete; config becomes composition source |
| Plugin Loader | `PluginLoader` becomes kernel service; config-dir tools become plugins |

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
10. **UI** → UI bundles (M6)
10. **Desktop** → desktop bundle (M6)
11. **Agent Runtime** → agent plugins (M5)
11. **UI** → UI bundles (M6)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
12. **UI** → UI bundles (M6)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
11. **UI** → UI bundles (M6)
12. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
12. **UI** → UI bundles (M6)
13. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)