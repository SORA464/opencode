// @ts-nocheck
/**
 * M4 — Composition inspector & provenance + diff + lock
 */
import type { EffectiveComposition } from "./engine"
import { Buffer } from "buffer"

export function inspect(effective: EffectiveComposition): string {
  return `Profile: ${effective.profile}\nPlugins: ${effective.plugins.map((p) => `${p.id}@${p.version}`).join(", ")}\nOrder: ${effective.order.join(" -> ")}\nProvenance: ${effective.provenance.map((p) => `${p.id}@${p.layer}`).join(", ")}`
}

export function diff(a: EffectiveComposition, b: EffectiveComposition): { added: string[]; removed: string[]; changed: string[] } {
  const aIds = new Set(a.plugins.map((p) => p.id))
  const bIds = new Set(b.plugins.map((p) => p.id))
  return {
    added: [...bIds].filter((id) => !aIds.has(id)),
    removed: [...aIds].filter((id) => !bIds.has(id)),
    changed: [...aIds].filter((id) => bIds.has(id) && 
      a.plugins.find((p) => p.id === id)?.version !== b.plugins.find((p) => p.id === id)?.version),
  }
}

export function lock(effective: EffectiveComposition): { hash: string; plugins: Record<string, string> } {
  const plugins: Record<string, string> = {}
  for (const p of effective.plugins) plugins[p.id] = p.version
  const hash = Buffer.from(JSON.stringify(plugins)).toString("base64").slice(0, 16)
  return { hash, plugins }
}
