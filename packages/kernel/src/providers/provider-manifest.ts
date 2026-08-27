/**
 * K-M3 — Provider manifest contract (analogous to tool manifests)
 */
export interface ProviderManifest {
  readonly id: string
  readonly version: string
  readonly providerId: string
  readonly supportedModels: ReadonlyArray<string>
  readonly capabilities: ReadonlyArray<string>
  readonly dependencies: ReadonlyArray<string>
  readonly permissions: ReadonlyArray<string>
  readonly transport: "http" | "websocket"
  readonly credential: { readonly envVars: ReadonlyArray<string> }
  readonly plugin: string
}

export function validate(m: ProviderManifest): string[] {
  const errs: string[] = []
  if (!m.id) errs.push("id required")
  if (!m.providerId) errs.push("providerId required")
  if (!m.plugin) errs.push("plugin entry required")
  return errs
}
