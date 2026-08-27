/**
 * K-M3 — Provider loader (deterministic, failure-isolated)
 */
import { ProviderRegistry } from "./provider-registry"
import { ModelRegistry } from "./model-registry"
import { type ProviderManifest, validate } from "./provider-manifest"

export class ProviderLoader {
  constructor(private readonly providers: ProviderRegistry, private readonly models: ModelRegistry) {}
  async load(manifests: ReadonlyArray<ProviderManifest>): Promise<{ loaded: string[]; failed: Array<{ id: string; error: string }> }> {
    const loaded: string[] = []
    const failed: Array<{ id: string; error: string }> = []
    for (const m of manifests) {
      const errs = validate(m)
      if (errs.length > 0) { failed.push({ id: m.id, error: errs.join(", ") }); continue }
      try {
        this.providers.register({ id: m.providerId, version: m.version, manifests: m, health: "healthy", provenance: m.plugin })
        for (const model of m.supportedModels) {
          this.models.register({ id: model, providerId: m.providerId, metadata: {}, capabilities: {} })
        }
        loaded.push(m.id)
      } catch (e) {
        failed.push({ id: m.id, error: e instanceof Error ? e.message : String(e) })
      }
    }
    return { loaded, failed }
  }
}
