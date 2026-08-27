# M4.21 — V1/V2 Composition Migration

## 1. V1/V2 Dual-Stack Reality

| Layer | V1 (Legacy) | V2 (New) | Status |
|---|---|---|---|
| Tools | 14 tools in `opencode/src/tool/registry.ts` | 12 builtins in `core/src/tool/builtins.ts` | Both active |
| Session | `opencode/src/session/` | `core/src/session/` | Both active |
| Provider | `opencode/src/provider/provider.ts` | `llm/` + `session/llm.ts` | Both active |
| Config | V1 `ConfigV1` + migration | V2 `Config` | Both active |
| Account | `opencode/src/account.ts` | `core/src/account.ts` | Both active |
| Session | `opencode/src/session/` | `core/src/session/` | Both active |

## 1. V1/V2 Dual-Stack Reality

| Layer | V1 (Legacy) | V2 (New) | Status |
|---|---|---|---|
| Tools | 14 tools in `opencode/src/tool/registry.ts` | 12 builtins in `core/src/tool/builtins.ts` | Both active |
| Session | `opencode/src/session/` | `core/src/session/` | Both active |
| Provider | `opencode/src/provider/provider.ts` | `llm/` + `session/llm.ts` | Both active |
| Config | V1 `ConfigV1` + migration | V2 `Config` | Both active |
| Account | `opencode/src/account.ts` | `core/src/account.ts` | Both active |

## 2. Migration Strategy

| Layer | V1 Location | V2 Location | Migration Path |
|---|---|---|---|
| Tools | `opencode/src/tool/registry.ts` (14 tools) | `core/src/tool/builtins.ts` (12 tools) | M2: migrated 6; 8 remain |
| Session | `opencode/src/session/` | `core/src/session/` | V2 complete; V1 deprecated |
| Provider | `opencode/src/provider/provider.ts` | `llm/` + `session/llm.ts` | M3: registry-based |
| Config | V1 `ConfigV1` + migration | V2 `Config` | Migration in progress |
| Account | `opencode/src/account.ts` | `core/src/account.ts` | Parallel; V2 authoritative |

## 2. Migration Strategy

| Layer | V1 Location | V2 Location | Migration Path |
|---|---|---|---|
| Tools | `opencode/src/tool/registry.ts` (14 tools) | `core/src/tool/builtins.ts` (12 tools) | M2: migrated 6; 8 remain |
| Session | `opencode/src/session/` | `core/src/session/` | V2 complete; V1 deprecated |
| Provider | `opencode/src/provider/provider.ts` | `llm/` + `session/llm.ts` | M3: registry-based |
| Config | V1 `ConfigV1` + migration | V2 `Config` | Migration in progress |
| Account | `opencode/src/account.ts` | `core/src/account.ts` | Parallel; V2 authoritative |

## 2. Migration Strategy

| Layer | V1 Location | V2 Location | Migration Path |
|---|---|---|---|
| Tools | `opencode/src/tool/registry.ts` (14 tools) | `core/src/tool/builtins.ts` (12 tools) | M2: migrated 6; 8 remain |
| Session | `opencode/src/session/` | `core/src/session/` | V2 complete; V1 deprecated |
| Provider | `opencode/src/provider/provider.ts` | `llm/` + `session/llm.ts` | M3: registry-based |
| Config | V1 `ConfigV1` + migration | V2 `Config` | Migration in progress |
| Account | `opencode/src/account.ts` | `core/src/account.ts` | Parallel; V2 authoritative |

## 2. Migration Strategy

| Layer | V1 Location | V2 Location | Migration Path |
|---|---|---|---|
| Tools | `opencode/src/tool/registry.ts` (14 tools) | `core/src/tool/builtins.ts` (12 tools) | M2: migrated 6; 8 remain |
| Session | `opencode/src/session/` | `core/src/session/` | V2 complete; V1 deprecated |
| Provider | `opencode/src/provider/provider.ts` | `llm/` + `session/llm.ts` | M3: registry-based |
| Config | V1 `ConfigV1` + migration | V2 `Config` | Migration in progress |
| Account | `opencode/src/account.ts` | `core/src/account.ts` | Parallel; V2 authoritative |

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
12. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)
13. **UI** → UI bundles (M6)
14. **Desktop** → desktop bundle (M6)
14. **Agent Runtime** → agent plugins (M5)

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