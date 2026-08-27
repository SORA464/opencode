# M2.9 — Compatibility Layer

> Implementation: `packages/kernel/src/tools/compatibility.ts` + `packages/kernel/src/compatibility.ts`

- `DEPRECATED_TOOL_IDS` map: `shell → bash` and self-maps for `read,write,edit,bash` preserve old V1 names.
- `resolveCompatId(id)` — call sites use this to support both old and new names during migration.
- `compatShim` helper logs `[kernel compat]` note for deprecated paths (future: deprecation warning).
- Old APIs preserved: `opencode.tools.register`, `ToolRegistry.Service` direct use, V1 tool names, `tools` field in `PromptInput` (still parsed, annotated deprecated).
- Kernel re-exports keep `import { LayerNode } from "@opencode-ai/core/effect/layer-node"` working via `compatibility.ts` bridge.

**Rule:** Compatibility layer is additive and retained exactly one release per migrated family, then deleted in a separate phase (debt firewall).

