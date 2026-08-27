/**
 * K-M2 — Tool plugin manifests
 * Each tool declares id, version, permissions, dependencies, capabilities, compat.
 */
import type { ToolMetadata } from "./tool-contract"

export interface ToolManifest extends ToolMetadata {
  readonly permissions: ReadonlyArray<string>
  readonly dependencies: ReadonlyArray<string>
  readonly capabilities: ReadonlyArray<string>
  readonly plugin: string // entry path
}

export function validate(m: ToolManifest): string[] {
  const errs: string[] = []
  if (!m.id) errs.push("id required")
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(m.id)) errs.push(`invalid id ${m.id}`)
  if (!m.version) errs.push("version required")
  if (!m.plugin) errs.push("plugin entry required")
  return errs
}

// Built-in manifests (priority order per M2.6)
export const BUILT_IN_MANIFESTS: ReadonlyArray<ToolManifest> = [
  { id: "read", version: "1.0.0", description: "Read file", permissions: ["read"], dependencies: [], capabilities: ["fs.read"], plugin: "./builtins/read.ts", compatibility: { kernel: "^1.0.0" } },
  { id: "write", version: "1.0.0", description: "Write file", permissions: ["edit"], dependencies: [], capabilities: ["fs.write"], plugin: "./builtins/write.ts", compatibility: { kernel: "^1.0.0" } },
  { id: "edit", version: "1.0.0", description: "Edit file", permissions: ["edit"], dependencies: [], capabilities: ["fs.write"], plugin: "./builtins/edit.ts", compatibility: { kernel: "^1.0.0" } },
  { id: "glob", version: "1.0.0", description: "Glob search", permissions: ["glob"], dependencies: ["read"], capabilities: ["search"], plugin: "./builtins/glob.ts", compatibility: { kernel: "^1.0.0" } },
  { id: "grep", version: "1.0.0", description: "Grep search", permissions: ["grep"], dependencies: ["read"], capabilities: ["search"], plugin: "./builtins/grep.ts", compatibility: { kernel: "^1.0.0" } },
  { id: "bash", version: "1.0.0", description: "Shell execution", permissions: ["bash"], dependencies: [], capabilities: ["exec"], plugin: "./builtins/bash.ts", compatibility: { kernel: "^1.0.0" } },
  { id: "webfetch", version: "1.0.0", description: "Fetch URL", permissions: ["webfetch"], dependencies: [], capabilities: ["net.fetch"], plugin: "./builtins/webfetch.ts", compatibility: { kernel: "^1.0.0" } },
] as const

export * as ToolManifestNS from "./tool-manifest"
