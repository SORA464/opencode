/**
 * M2.7 — Permission integration with kernel SEP
 */
import { Permission } from "../permission"

export function checkToolPermission(policy: Permission.Policy, plugin: string, toolId: string): boolean {
  // Tool permission name defaults to tool id; shared family "edit" is explicit in manifest
  const cap = `tool.${toolId}`
  // SEP floor is deny-by-default for sensitive caps; tool caps are grantable
  // For M2 we treat tool execution as grantable via policy grants
  return Permission.isAllowed(policy, plugin, cap) || !policy.floor.has(cap)
}

export function verifyBoundaries(toolId: string, targetPath: string, workspace: string): string[] {
  const errs: string[] = []
  // Filesystem boundary: lexical + realPath check stub (real check in fs tool)
  if (targetPath.includes("..") && !targetPath.startsWith(workspace)) {
    errs.push(`filesystem boundary violation for ${toolId}: ${targetPath}`)
  }
  return errs
}

export * as ToolPermission from "./permission-integration"
