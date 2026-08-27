/**
 * M4 — Canonical composition schema (versioned)
 * Composition Data -> Validation -> Dependency Resolution -> Ordered Composition
 */
import { Schema } from "effect"

export const CompositionSchemaVersion = "1" as const

export const PluginContribution = Schema.Struct({
  id: Schema.String.pipe(Schema.pattern(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/)),
  version: Schema.String,
  services: Schema.optional(Schema.Array(Schema.String)),
  events: Schema.optional(Schema.Array(Schema.String)),
  tools: Schema.optional(Schema.Array(Schema.String)),
  providers: Schema.optional(Schema.Array(Schema.String)),
  agents: Schema.optional(Schema.Array(Schema.String)),
})

export const PluginManifest = Schema.Struct({
  id: Schema.String.pipe(Schema.pattern(/^[A-Za-z][A-Za-z0-9_-]{0,63}(:[A-Za-z0-9_-]+)?$/)),
  version: Schema.String,
  contributes: PluginContribution,
  dependencies: Schema.optional(Schema.Array(Schema.String)),
  optionalDependencies: Schema.optional(Schema.Array(Schema.String)),
  capabilities: Schema.optional(Schema.Array(Schema.String)),
  permissions: Schema.optional(Schema.Array(Schema.String)),
  trustTier: Schema.optional(Schema.Literal("builtin", "verified", "community", "inline")),
  platformConstraints: Schema.optional(Schema.Array(Schema.String)),
  environmentConstraints: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
})

export const Profile = Schema.Struct({
  id: Schema.String,
  version: Schema.String,
  plugins: Schema.Array(Schema.String),
  description: Schema.optional(Schema.String),
})

export const Composition = Schema.Struct({
  version: Schema.Literal(CompositionSchemaVersion),
  profile: Schema.String,
  plugins: Schema.Array(PluginManifest),
  overrides: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
})

export type Composition = typeof Composition.Type
export type PluginManifest = typeof PluginManifest.Type
export type Profile = typeof Profile.Type

export function validateComposition(input: unknown): { ok: true; value: Composition } | { ok: false; errors: string[] } {
  const result = Schema.decodeUnknownEither(Composition)(input)
  if ((result as unknown as { _tag: string })._tag === "Right") {
    return { ok: true, value: (result as unknown as { right: Composition }).right }
  }
  const left = (result as unknown as { left: unknown }).left
  return { ok: false, errors: [String(left)] }
}

export * as CompositionSchema from "./schema"
