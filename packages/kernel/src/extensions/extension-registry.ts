/**
 * M7 — Extension ecosystem (generic plugin discovery/install/manifest/versioning/dependencies/trust/enable/upgrade/rollback/quarantine/provenance)
 */
export interface ExtensionManifest {
  readonly id: string
  readonly version: string
  readonly kind: "tool" | "provider" | "agent" | "ui" | "connector" | "workflow"
  readonly permissions: ReadonlyArray<string>
  readonly trustTier: string
}

export class ExtensionRegistry {
  private readonly map = new Map<string, ExtensionManifest & { status: "active" | "quarantined" | "disabled" }>()
  register(m: ExtensionManifest): void { this.map.set(m.id, { ...m, status: "active" }) }
  quarantine(id: string): void { const e = this.map.get(id); if (e) this.map.set(id, { ...e, status: "quarantined" }) }
  disable(id: string): void { const e = this.map.get(id); if (e) this.map.set(id, { ...e, status: "disabled" }) }
  list(): ReadonlyArray<ExtensionManifest & { status: string }> { return [...this.map.values()] }
}
