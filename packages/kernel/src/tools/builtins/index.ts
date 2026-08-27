/**
 * Built-in tool plugins — thin wrappers re-exporting core tools as kernel plugins.
 * Priority order per M2.6: filesystem → read → write → search → shell → execution → remaining.
 * In M2 these are wrappers; in M4 they become true bundle contributions.
 * M2 spec: wrappers are placeholders; real wiring is validated via toolchain harness, not compile-time import.
 */
export const read = { id: "read" } as unknown
export const write = { id: "write" } as unknown
export const edit = { id: "edit" } as unknown
export const glob = { id: "glob" } as unknown
export const grep = { id: "grep" } as unknown
export const bash = { id: "bash" } as unknown

// Re-export for registry wiring
export const builtinTools: Record<string, unknown> = { read, write, edit, glob, grep, bash }
