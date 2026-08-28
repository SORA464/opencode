/**
 * M6 — UI manifest contract
 */
export interface UIManifest {
  readonly id: string
  readonly version: string
  readonly contributions: ReadonlyArray<{ id: string; capability: string; component: string }>
  readonly permissions?: ReadonlyArray<string>
  readonly dependencies?: ReadonlyArray<string>
}

export function validate(m: UIManifest): string[] {
  const e: string[] = []
  if (!m.id) e.push("id required")
  if (!m.version) e.push("version required")
  return e
}
