// @ts-nocheck
/**
 * M4 — Profile system
 */
import { Composition } from "./schema"

export interface Profile {
  name: string
  extends?: string
  layers: Array<{ name: string; plugins: Array<{ id: string; version: string }> }>
  settings: Record<string, unknown>
}

export const BUILTIN_PROFILES: Record<string, Profile> = {
  default: { name: "default", layers: [{ name: "default", plugins: [] }], settings: {} },
  standard: { name: "standard", extends: "default", layers: [], settings: {} },
  minimal: { name: "minimal", extends: "default", layers: [], settings: {} },
}

export function resolveProfile(name: string): Profile {
  const profile = BUILTIN_PROFILES[name]
  if (!profile) throw new Error(`Unknown profile: ${name}`)
  if (profile.extends) {
    const parent = resolveProfile(profile.extends)
    return { ...parent, ...profile, layers: [...parent.layers, ...profile.layers] }
  }
  return profile
}
