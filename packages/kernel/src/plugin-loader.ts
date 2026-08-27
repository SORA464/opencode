/**
 * K2 lifecycle portion — plugin loader state machine.
 * Pure state transitions; kernel will drive these via Effect fibers in M1 follow-up.
 */
import type { Manifest } from "./manifest"

export type Lifecycle = "PENDING" | "LOADING" | "ACTIVE" | "DEGRADED" | "UNLOADING" | "DISPOSED" | "FAILED"

export interface PluginRecord {
  readonly manifest: Manifest
  readonly lifecycle: Lifecycle
  readonly error?: string
}

export class Loader {
  private readonly map = new Map<string, PluginRecord>()

  register(manifest: Manifest): PluginRecord {
    if (this.map.has(manifest.name)) throw new Error(`Plugin already registered: ${manifest.name}`)
    const rec: PluginRecord = { manifest, lifecycle: "PENDING" }
    this.map.set(manifest.name, rec)
    return rec
  }

  setLifecycle(name: string, lifecycle: Lifecycle, error?: string): PluginRecord {
    const rec = this.map.get(name)
    if (!rec) throw new Error(`Unknown plugin: ${name}`)
    const next: PluginRecord = { ...rec, lifecycle, error }
    this.map.set(name, next)
    return next
  }

  get(name: string): PluginRecord | undefined {
    return this.map.get(name)
  }

  list(): ReadonlyArray<PluginRecord> {
    return [...this.map.values()]
  }
}

export * as PluginLoader from "./plugin-loader"
