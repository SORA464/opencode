# M2 Migration Map (Per Tool Family)

> Priority order per M2.6: filesystem → read → write → search → shell → execution → remaining.

| Family | Tools | Current State | M2 Intermediate | Plugin State | Risk | Rollback |
|---|---|---|---|---|---|---|
| Filesystem (read) | read | V1 read + V2 read (paging, images) | Kernel registry + manifest `read@1.0.0`, V1 compat shim, both registries green | `bundle-tools-fs` | Low — read is pure | Feature flag revert to V1 read |
| Write/Edit | write, edit, apply_patch | 3 tools sharing `edit` permission, per-path Semaphore leak | Kernel manifests, shared `edit` family preserved, Semaphore leak noted for M2 hardening (replace with KeyedMutex) | `bundle-tools-edit` | Medium — file mutation | Golden file fixtures |
| Search | glob, grep | ripgrep-backed | Manifest with ripgrep dep declared | `bundle-tools-search` | Low | Flag revert |
| Shell | bash/shell | V1 shell (parser approvals) + V2 bash (12 TODOs) | V2 bash as plugin, V1 shell shim, caps preserved (120s/600s, 1MB) | `bundle-tools-shell` | High — execution | Compatibility layer keeps both |
| Execution/Task | task | subagents, depth limit | Spec only in M2 (task needs agent loop seam — M5) | `bundle-tools-task` | High — defer to M5 | Not migrated in M2 |
| Remaining | webfetch, websearch, skill, question, todowrite, lsp, plan_exit, code-mode | mixed, flag-gated | Each as plugin spec, experimental flags preserved | `bundle-tools-*` | Low–Med | Flag revert |

All families preserve permission names, input schemas, and output caps. One family migrates per PR in M2.

