/**
 * M2.8 — Failure containment for tool plugins
 */
export type QuarantineReason = "load-failure" | "execution-failure" | "validation-failure"

export interface Quarantined {
  readonly id: string
  readonly reason: QuarantineReason
  readonly error: string
  readonly at: number
}

export class FailureContainment {
  private readonly quarantined = new Map<string, Quarantined>()

  quarantine(id: string, reason: QuarantineReason, error: string): void {
    this.quarantined.set(id, { id, reason, error, at: Date.now() })
  }

  isQuarantined(id: string): boolean {
    return this.quarantined.has(id)
  }

  release(id: string): void {
    this.quarantined.delete(id)
  }

  list(): ReadonlyArray<Quarantined> {
    return [...this.quarantined.values()]
  }

  /**
   * Graceful degradation: tool call on quarantined plugin returns typed failure, never crashes runtime.
   */
  guard<T>(id: string, fn: () => T): T | { error: string } {
    if (this.isQuarantined(id)) return { error: `Tool ${id} is quarantined` }
    try {
      return fn()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      this.quarantine(id, "execution-failure", msg)
      return { error: msg }
    }
  }
}

export * as FailureContainmentNS from "./failure-containment"
