/**
 * M2.9 — Compatibility layer for tool system
 * Preserves old APIs: `opencode.tools.register`, `ToolRegistry.Service` direct use,
 * and V1 tool names. New kernel registry is additive; old paths delegate.
 */
export const COMPAT_VERSION = "1" as const

export function compatShim(oldId: string, newId: string): string {
  return `[compat] ${oldId} → ${newId}`
}

// Registry of deprecated tool ids that still resolve
export const DEPRECATED_TOOL_IDS: ReadonlyMap<string, string> = new Map([
  ["read", "read"],
  ["write", "write"],
  ["edit", "edit"],
  ["bash", "bash"],
  ["shell", "bash"], // V1 shell → V2 bash
] as const)

export function resolveCompatId(id: string): string {
  return DEPRECATED_TOOL_IDS.get(id) ?? id
}

export * as ToolCompatibility from "./compatibility"
