/**
 * Permission framework — SEP floor + trust-tier grants.
 * M1: model + enforcement helper; no UI flow yet.
 */
export type TrustTier = "builtin" | "verified" | "community" | "inline"

export type Capability = string

export interface Policy {
  readonly floor: ReadonlySet<Capability>
  readonly grants: ReadonlyMap<string, ReadonlySet<Capability>>
}

export function createPolicy(floor: ReadonlyArray<Capability>): Policy {
  return { floor: new Set(floor), grants: new Map() }
}

export function grant(policy: Policy, plugin: string, caps: ReadonlyArray<Capability>): Policy {
  const next = new Map(policy.grants)
  next.set(plugin, new Set(caps))
  return { ...policy, grants: next }
}

export function isAllowed(policy: Policy, plugin: string, cap: Capability): boolean {
  if (policy.floor.has(cap)) return false // floor is deny-by-default; never grantable
  const g = policy.grants.get(plugin)
  return g ? g.has(cap) : false
}

export const SEP_FLOOR: ReadonlyArray<Capability> = [
  "fs.write.outside-workspace",
  "exec.outside-sandbox",
  "credentials.read",
]

export * as Permission from "./permission"
