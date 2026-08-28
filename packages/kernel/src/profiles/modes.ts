/**
 * K-DSH-F — Profile / Mode integration.
 *
 * Selectable agent execution modes as composition data over the same core
 * runtime. Standard (native tools), Code (PTC), Minimal (reduced tools), and
 * Assistant (conversation) are compositions, not separate runtimes.
 */
export type ProductMode = "standard" | "code" | "minimal" | "assistant"

export interface ModeProfile {
  readonly id: ProductMode
  readonly description: string
  readonly toolMode: "standard" | "code"
  readonly tools: ReadonlyArray<string>
  readonly context: ReadonlyArray<string>
}

export const MODE_PROFILES: Readonly<Record<ProductMode, ModeProfile>> = {
  standard: {
    id: "standard",
    description: "Direct tool calling with the full mature OpenCode tool registry",
    toolMode: "standard",
    tools: ["read", "write", "edit", "glob", "grep", "bash", "webfetch", "question", "skill", "todowrite"],
    context: ["runtime", "tools"],
  },
  code: {
    id: "code",
    description: "Programmatic tool orchestration via generated SDK + Code Runtime",
    toolMode: "code",
    tools: ["run_code"],
    context: ["runtime", "tools:sdk"],
  },
  minimal: {
    id: "minimal",
    description: "Reduced toolset (shell + editor) for benchmarking and constrained runs",
    toolMode: "standard",
    tools: ["bash", "read", "edit"],
    context: ["runtime"],
  },
  assistant: {
    id: "assistant",
    description: "Conversation-only composition over the same core runtime",
    toolMode: "standard",
    tools: [],
    context: ["runtime"],
  },
}

export function resolveMode(mode: ProductMode): ModeProfile {
  const profile = MODE_PROFILES[mode]
  if (!profile) throw new Error(`unknown product mode: ${mode}`)
  return profile
}

export function selectToolSet(mode: ProductMode, available: ReadonlyArray<string>): ReadonlyArray<string> {
  const profile = resolveMode(mode)
  if (profile.tools.length === 0) return []
  return profile.tools.filter((t) => available.includes(t) || t === "run_code")
}
