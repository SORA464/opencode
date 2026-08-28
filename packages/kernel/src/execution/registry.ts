/**
 * K-DSH-A — Execution World registry (authoritative)
 */
import type { ExecWorld } from "./execution-world"

export interface ExecWorldEntry {
  readonly id: string
  readonly version: string
  readonly world: ExecWorld
  readonly trustTier: string
}

export class ExecWorldRegistry {
  private readonly map = new Map<string, ExecWorldEntry>()
  register(e: ExecWorldEntry): void {
    if (this.map.has(e.id)) throw new Error(`execution world ${e.id} already registered`)
    this.map.set(e.id, e)
  }
  get(id: string): ExecWorldEntry | undefined { return this.map.get(id) }
  list(): ReadonlyArray<ExecWorldEntry> { return [...this.map.values()] }
  remove(id: string): void { this.map.delete(id) }
}

export const globalExecWorldRegistry = new ExecWorldRegistry()
