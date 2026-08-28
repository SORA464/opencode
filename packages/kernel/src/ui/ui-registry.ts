/**
 * M6 — UI registry (authoritative, kernel-owned)
 * Supports routes, views, panels, sidebars, inspectors, dashboards, settings, commands.
 */
export type UICapability = "routes" | "views" | "panels" | "sidebars" | "settings" | "commands" | "dashboards" | "inspectors"

export interface UIContribution {
  readonly id: string
  readonly capability: UICapability
  readonly component: string
  readonly permissions?: ReadonlyArray<string>
  readonly trustTier?: string
}

export class UIRegistry {
  private readonly map = new Map<string, UIContribution>()
  register(c: UIContribution): void {
    if (this.map.has(c.id)) throw new Error(`UI contribution ${c.id} already registered`)
    this.map.set(c.id, c)
  }
  get(id: string): UIContribution | undefined { return this.map.get(id) }
  list(capability?: UICapability): ReadonlyArray<UIContribution> {
    const all = [...this.map.values()]
    return capability ? all.filter((c) => c.capability === capability) : all
  }
  remove(id: string): void { this.map.delete(id) }
}

export const globalUIRegistry = new UIRegistry()
