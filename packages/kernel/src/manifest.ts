/**
 * Plugin manifest types (opencode.contributes analog of dsh field).
 * M1: types + validation only; no filesystem discovery yet (spec).
 */
export type PluginKind = "plugin" | "bundle" | "profile"

export interface Contributes {
  readonly tools?: ReadonlyArray<{ readonly id: string }>
  readonly providers?: ReadonlyArray<{ readonly id: string; readonly npm?: string }>
  readonly commands?: ReadonlyArray<{ readonly name: string; readonly title?: string }>
  readonly ui?: {
    readonly slots?: ReadonlyArray<string>
    readonly routes?: ReadonlyArray<string>
  }
  readonly configSchema?: string
}

export interface Manifest {
  readonly name: string
  readonly version: string
  readonly kind?: PluginKind
  readonly plugin?: string
  readonly inject?: ReadonlyArray<string>
  readonly contributes?: Contributes
  readonly permissions?: ReadonlyArray<string>
  readonly engines?: { readonly "opencode-kernel"?: string }
}

export function validate(m: Manifest): string[] {
  const errs: string[] = []
  if (!m.name) errs.push("name is required")
  if (!m.version) errs.push("version is required")
  if (m.plugin && !m.plugin.endsWith(".ts") && !m.plugin.endsWith(".js")) {
    errs.push("plugin entry should be .ts/.js")
  }
  return errs
}

export * as Manifest from "./manifest"
