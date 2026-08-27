/**
 * K-M2 — Canonical tool contract (kernel-owned, versioned)
 * All future tools conform to this contract; it is the compatibility anchor.
 * M2: spec-only, no runtime dependency on core (avoids transitive type errors).
 */
export type Tool = unknown

export const KERNEL_TOOL_API_VERSION = "1" as const

export interface ToolMetadata {
  readonly id: string
  readonly version: string
  readonly description: string
  readonly capabilities?: ReadonlyArray<string>
  readonly compatibility: { readonly kernel: string }
}

export function validateId(id: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(id)
}

export type AnyTool = unknown

export const make = (..._args: unknown[]): AnyTool => ({} as AnyTool)
export const withPermission = (tool: AnyTool, _perm: string): AnyTool => tool
export const permission = (_tool: AnyTool, name: string): string => name
export const definition = (_name: string, _tool: AnyTool): unknown => ({})
export const settle = (_tool: AnyTool, _call: unknown, _ctx: unknown): unknown => ({})
