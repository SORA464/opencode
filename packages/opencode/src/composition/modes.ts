/**
 * M6-M7 — Profile/mode composition (Standard/Code/Minimal/Assistant as data)
 * Each mode is a composition over the same kernel runtime — no second architecture.
 */
import { Modes } from "@opencode-ai/kernel"

export function getProfile(mode: Modes.ProductMode) {
  return Modes.resolveMode(mode)
}

export const PROFILES = Modes.MODE_PROFILES
