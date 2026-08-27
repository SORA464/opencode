/**
 * Configuration framework — layered merge + schema validation stub.
 * M1: layered object merge with provenance; real Flag/env sweep stays in core for now.
 */
export type Layer = Record<string, unknown>

export function mergeLayers(layers: ReadonlyArray<Layer>): Layer {
  const out: Record<string, unknown> = {}
  for (const layer of layers) {
    for (const [k, v] of Object.entries(layer)) {
      if (v !== undefined) out[k] = v
    }
  }
  return out
}

export interface ValidationResult {
  readonly ok: boolean
  readonly errors: ReadonlyArray<string>
}

export function validate(_schema: unknown, _value: unknown): ValidationResult {
  // Real JSON Schema validation lands in M1 follow-up; stub keeps API stable.
  return { ok: true, errors: [] }
}

export * as Config from "./config"
