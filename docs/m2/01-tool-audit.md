# M2.1 — Tool Audit (Complete)

> Baseline: f7ff815fc + M1 kernel 8499ca537. No agent/provider/UI changes in this phase.

## 1. Implementations

### V2 canonical (core, the future)
| Tool | File | Contract | Permission | Lifecycle |
|---|---|---|---|---|
| bash | `core/src/tool/bash.ts` | `Tool.make({input:{command,timeout}, output:{output}})` | `bash` | Location-scoped layer, captures PermissionV2 at construction |
| read | `core/src/tool/read.ts` | paging input | `read` | Location |
| edit | `core/src/tool/edit.ts` | exact replace | `edit` (shared) | Location, per-path Semaphore (leak) |
| write | `core/src/tool/write.ts` | write file | `edit` | Location |
| apply_patch | `core/src/tool/apply-patch.ts` | multi-file patch | `edit` | Location |
| glob | `core/src/tool/glob.ts` | pattern + ripgrep | `glob` | Location |
| grep | `core/src/tool/grep.ts` | regex | `grep` | Location |
| webfetch | `core/src/tool/webfetch.ts` | URL → markdown | `webfetch` | Location |
| websearch | `core/src/tool/websearch.ts` | query | `websearch` | Location |
| question | `core/src/tool/question.ts` | structured ask | `question` | Location |
| skill | `core/src/tool/skill.ts` | skill name | `skill` | Location |
| todowrite | `core/src/tool/todowrite.ts` | todo list | `todowrite` | Location |

### V1 shipped (opencode, the present)
| Tool | File | Notes |
|---|---|---|
| shell | `opencode/src/tool/shell.ts` (+ shell/* parser) | permission `bash`, 120s/600s, parser-based approvals |
| read/glob/grep/edit/write | `opencode/src/tool/*.ts` + `.txt` descriptions | edit/write share `edit` |
| task | `opencode/src/tool/task.ts` | subagents, `subagent_depth` |
| webfetch/fetch | `webfetch.ts` | `webfetch` |
| todo | `todo.ts` | `todowrite` |
| websearch | `websearch.ts` + `mcp-websearch.ts` | conditional on opencode provider |
| skill | `skill.ts` | `skill` |
| patch | `apply_patch.ts` | only for gpt-* |
| code-mode/execute | `code-mode.ts` | experimental |
| lsp | `lsp.ts` | flag-gated |
| plan_exit | `plan.ts` | experimental plan mode |
| question | `question.ts` | client-gated |
| invalid | `invalid.ts` | fallback |

### Dynamic seams (both generations)
- Config-dir tools `{tool,tools}/*.{js,ts}` → dynamic import, namespaced `${ns}_${export}`
- Plugin `p.tool` map
- MCP tools via `McpCatalog.convertTool` per-session (permission per-tool)

## 2. Contracts

Canonical: `Tool.make({description,input,output,structured,toStructuredOutput,execute,toModelOutput})` → opaque `Definition<Input,Output>`; `ToolDefinition` derived per name via `toJsonSchema`; settlement via `Tool.settle(call, context)` with `ToolFailure` typed errors. Validation: `validateName` regex `^[A-Za-z][A-Za-z0-9_-]{0,63}$`.

## 3. Registration paths

- **V2:** `ApplicationTools.Service.register` (process-scoped, public `opencode.tools.register`) ⊕ `Tools.Service.register` (Location-scoped, builtins). Latest same-placement wins, closing reveals prior (finalizer). Location ⊕ Application overlay, definitions filtered by `PermissionV2.Ruleset`.
- **V1:** static import list in `tool/registry.ts` + per-instance `init` of `ToolRegistry` (15 tools) + dynamic seams above.

## 4. Execution paths

- V2: `ToolRegistry.Materialization.settle` is sole execution + model-output bounding boundary; captures leaf policy via `source={type:"tool",messageID,callID}`; `Effect` with interruption preserved (no `catchCause`).
- V1: `session/tools.ts` → `McpCatalog` + `tool/registry` → `permission/index` evaluate.

## 5. Permissions, dependencies, lifecycle

| Aspect | V2 | V1 |
|---|---|---|
| Permission source | `PermissionV2.Service` captured at layer construction | `permission/evaluate.ts` arity |
| Dependency | `PermissionV2.Service` + Location services | same |
| Lifecycle | Location layer finalizers; `Scope` per registration | InstanceStore ScopedCache per directory |
| Shared infra | `ToolOutputStore`, `ApplicationTools`, `Registry` | `ToolRegistry`, `BackgroundJob` |

Shared infra: `ToolOutputStore` (managed retention), `AppProcess.maxOutputBytes` (bash caps), ripgrep binary, tree-sitter WASM.

## 6. Classification (A-D)

| Component | Class | Rationale |
|---|---|---|
| `Tool.make` contract + `ToolDefinition` derivation | **A Kernel** | universal, versioned, must be stable |
| `ToolRegistry` overlay algebra | **A Kernel** | Location vs Application scoping is a kernel invariant |
| `ApplicationTools` process-scoped store | **C Shared service** | kernel-owned but distinct from registry |
| Each built-in tool implementation (bash, read, etc.) | **B Plugin** | replaceable capability, declares permission |
| Config-dir dynamic tool loading | **B Plugin** (loader is kernel, tools are plugins) | discovery seam |
| Plugin `p.tool` contributions | **B Plugin** | already plugin-shaped |
| MCP-converted tools | **B Plugin** (via MCP bridge bundle) | per-session, permission per-tool |
| Permission attachment (`withPermission`) | **A Kernel** (internal op) | definition filtering, not execution auth |
| Output bounding in `settle` | **A Kernel** | generic model-output safety |
| `invalid` fallback, client-gated `question` | **D Deprecated** | to be retired when v2 parity complete |

## 7. Migration map (per tool family, priority order)

| Priority | Family | Current | Intermediate (M2) | Plugin state (target) |
|---|---|---|---|---|
| 1 | Filesystem (read) | V1 read + V2 read | Kernel registry with manifest, V1 compat shims, both registries green | `bundle-tools-fs` plugin, V1 read removed |
| 2 | Write/edit/apply_patch | 3 tools sharing `edit` | Single `edit` permission family as plugin bundle | `bundle-tools-edit` |
| 3 | Search (glob/grep) | ripgrep-backed | Same, with manifest-declared ripgrep dep | `bundle-tools-search` |
| 4 | Shell (bash/shell) | V1 shell + V2 bash (12 TODOs) | V2 bash as plugin, V1 shell as compat, shared caps | `bundle-tools-shell` |
| 5 | Execution (task) | V1 task | V2 task plugin (future) | `bundle-tools-task` |
| 6 | Remaining (webfetch, websearch, skill, question, todowrite, lsp, plan_exit, code-mode) | mixed | Each as plugin, flag-gated where experimental | `bundle-tools-*` |

