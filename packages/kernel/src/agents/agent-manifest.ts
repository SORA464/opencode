/**
 * K-M5 — Agent runtime manifest
 */
export interface AgentManifest {
  readonly id: string; readonly version: string; readonly runtimeId: string;
  readonly capabilities: ReadonlyArray<string>; readonly dependencies: ReadonlyArray<string>;
  readonly tools: ReadonlyArray<string>; readonly models: ReadonlyArray<string>;
  readonly permissions: ReadonlyArray<string>; readonly trustTier: string;
}
export function validate(m: AgentManifest): string[] {
  const e: string[] = []
  if (!m.id) e.push("id required")
  if (!m.runtimeId) e.push("runtimeId required")
  return e
}
