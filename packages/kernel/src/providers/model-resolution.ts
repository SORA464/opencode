/** K-M3 — Model resolution (plugin-driven, deterministic) */
import { ModelRegistry } from "./model-registry"
export function resolveModel(registry: ModelRegistry, id: string, opts: { aliases?: Record<string, string>; defaultModel?: string } = {}): string {
  const aliased = opts.aliases?.[id] ?? id
  const target = aliased || opts.defaultModel
  if (!target) throw new Error(`Unknown model: ${id}`)
  const entry = registry.get(target)
  if (!entry) throw new Error(`Model not found: ${target}`)
  return entry.id
}
