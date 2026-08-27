# M2.7 — Tool Permissions (Kernel SEP Integration)

> Implementation: `packages/kernel/src/tools/permission-integration.ts` + `packages/kernel/src/permission.ts` (SEP floor).

- Tool permission name defaults to tool `id`; shared family `edit` explicitly declared in manifest.
- `checkToolPermission(policy, plugin, toolId)` consults kernel `Permission` policy: floor is deny-by-default for `fs.write.outside-workspace`, `exec.outside-sandbox`, `credentials.read` (never grantable); tool caps are grantable per trust tier.
- `verifyBoundaries(toolId, targetPath, workspace)` — lexical check stub (real check in fs tool); returns violations.
- Existing `PermissionV2.Service` captured at Location layer construction is preserved; kernel SEP is the new enforcement point that will subsume it in M4.
- No privilege escalation: a tool cannot self-grant; `isAllowed` checks `policy.grants` set only by kernel, not by plugin.

Verification: `harness/m0/security.test.ts` 18/18 plus new `permission-integration` unit tests (grant/deny matrix).

