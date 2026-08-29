/**
 * M6-M7 — Profile/mode composition (Standard/Code/Minimal/Assistant as data)
 * Each mode is a composition over the same kernel runtime — no second architecture.
 */
import { MODE_PROFILES, resolveMode, type ProductMode } from "@opencode-ai/kernel/src/profiles/modes"

export function getProfile(mode: ProductMode) {
  return resolveMode(mode)
}

export const PROFILES = MODE_PROFILES
