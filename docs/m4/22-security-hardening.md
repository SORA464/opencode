# M4.25 — Security Hardening Report

## 1. Security Hardening Summary

### Kernel Security Floor (Non-overridable)
| Capability | Policy |
|---|---|
| `fs.write.outside-workspace` | Always denied |
| `exec.outside-sandbox` | Always denied |
| `credentials.read` | Deny by default; explicit grant only |
| `net.unrestricted` | Deny; explicit allow per domain |

### Trust Tiers & Auto-activation
| Tier | Auto-activate | Requires |
|---|---|---|
| `builtin` | Yes | — |
| `verified` | Yes | Valid signature |
| `community` | No | Explicit user grant |
| `inline` | Never | Manual enable only |

### Permission Enforcement
- SEP (Security Enforcement Point) is kernel-resident, non-unloadable
- All capability checks route through `Permission.isAllowed(policy, plugin, cap)`
- SEP floor cannot be patched by composition (compile-time + runtime guard)

## 1. Security Hardening Summary

### Kernel Security Floor (Non-overridable)
| Capability | Policy |
|---|---|
| `fs.write.outside-workspace` | Always denied |
| `exec.outside-sandbox` | Always denied |
| `credentials.read` | Deny by default; explicit grant only |
| `net.unrestricted` | Deny; explicit allow per domain |

### Trust Tiers & Auto-activation
| Tier | Auto-activate | Requires |
|---|---|---|
| `builtin` | Yes | — |
| `verified` | Yes | Valid signature |
| `community` | No | Explicit user grant |
| `inline` | Never | Manual enable only |

### Permission Enforcement
- SEP (Security Enforcement Point) is kernel-resident, non-unloadable
- All capability checks route through `Permission.isAllowed(policy, plugin, cap)`
- SEP floor cannot be patched by composition (compile-time + runtime guard)

## 2. Hardening Checklist

- [x] SEP floor compiled into kernel (non-patchable)
- [x] Trust tiers enforced at activation time
- [x] Permission checks at registration + execution
- [x] Credential boundary isolation (credential-boundary.ts)
- [x] Filesystem containment verified (lexical + realPath)
- [x] Supply-chain: pinned deps, no moving-branch artifacts
- [x] Adversarial composition tests in CI