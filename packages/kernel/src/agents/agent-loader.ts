/**
 * K-M5 — Agent runtime loader (deterministic, failure-isolated)
 */
import { AgentRuntimeRegistry } from "./agent-registry"
import { type AgentManifest, validate } from "./agent-manifest"
export class AgentLoader {
  constructor(private readonly registry: AgentRuntimeRegistry) {}
  async load(manifests: ReadonlyArray<AgentManifest>): Promise<{ loaded: string[]; failed: Array<{ id: string; error: string }> }> {
    const loaded: string[] = []; const failed: Array<{ id: string; error: string }> = []
    for (const m of manifests) {
      const errs = validate(m)
      if (errs.length > 0) { failed.push({ id: m.id, error: errs.join(", ") }); continue }
      try { this.registry.register({ id: m.runtimeId, version: m.version, capabilities: m.capabilities, health: "healthy" }); loaded.push(m.id) } catch (e) { failed.push({ id: m.id, error: e instanceof Error ? e.message : String(e) }) }
    }
    return { loaded, failed }
  }
}
