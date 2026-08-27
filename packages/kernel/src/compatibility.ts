/**
 * Compatibility bridge — keeps old import paths working while kernel becomes canonical.
 * M1: re-exports that preserve `import { LayerNode } from "@opencode-ai/core/effect/layer-node"`
 * alongside `import { Runtime } from "@opencode-ai/kernel/runtime"`.
 *
 * Future phases will add deprecation warnings here and codemods.
 */
export const COMPAT_VERSION = "1" as const

export function compatNote(from: string, to: string): string {
  return `[kernel compat] ${from} is now provided by ${to} — please migrate (compat shim will be removed after N-1 window).`
}

export * as Compatibility from "./compatibility"
