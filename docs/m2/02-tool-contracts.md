# M2.2 — Tool Contracts (Canonical)

> Machine-readable: `packages/kernel/src/tools/tool-contract.ts` (this is the contract).

## 1. Metadata

```ts
interface ToolMetadata {
  id: string                // ^[A-Za-z][A-Za-z0-9_-]{0,63}$
  version: string           // semver
  description: string
  capabilities?: string[]   // e.g. ["fs.read", "search"]
  compatibility: { kernel: string } // engines.opencode-kernel range
}
```

## 2. Schema

- `input: Schema.Codec<I, any>` — Effect Schema, validated via `inputSchema` JSON Schema derived by `toJsonSchema`.
- `output: Schema.Codec<O, any>` — validated domain output.
- `structured?: Schema` — alternative structured output (when `toStructuredOutput` present).
- All schemas are Effect Schema `Codec` with `never` error (pure).

## 3. Permissions

- `permission?: string` — action name checked via kernel SEP. Defaults to `id`.
- Shared family: `edit` covers `edit`, `write`, `apply_patch` (preserved from V1/V2).
- No tool may bypass `PermissionV2.Service`; registry has zero Permission dep by design — leaf captures it.

## 4. Execution model

```ts
execute(input: I, context: { sessionID, agent, assistantMessageID, toolCallID }): Effect< O, ToolFailure >
```

- `Effect` with interruption preserved (no `catchCause`); `ToolFailure` is only typed error.
- `toModelOutput?: ({input,output}) => Content[]` — text/file parts, data URIs for files.
- Output encoding: `Schema.encode(output)` then optional `structured` encode; failure → `ToolFailure`.

## 5. Outputs / Errors / Lifecycle

- Success: `{ structured, content: Content[] }` where `Content` is `text` or `file` (base64 data URI).
- Failure: `ToolFailure { message }` — never false success.
- Lifecycle: `PENDING` (deps unsatisfied) → `ACTIVE` (registered) → `DISPOSED` (finalizer reveals prior). Latest same-placement wins.

All future tools must conform; `validateName` enforces id shape at registration time.

