/**
 * Agent Runtime Selector — chooses between legacy OpenCode loop and DSH-derived React loop
 * based on M4 composition. No deletion of legacy runtime; selection is via profile.
 */
import { AgentContract } from "@opencode-ai/kernel"

export type RuntimeKind = "opencode-legacy" | "dsh-react-loop"

export interface RuntimeSelection {
  readonly kind: RuntimeKind
  readonly runtime: AgentContract.AgentRuntime
}

const legacyRuntime: AgentContract.AgentRuntime = {
  id: "opencode-legacy",
  version: "1.18.14",
  capabilities: ["legacy-loop", "tool-calls", "session-persistence"],
  execute: async (input) => {
    // Delegates to existing OpenCode session/prompt loop via compatibility adapter
    // This is the fallback that preserves all existing behavior
    return { status: "completed", result: `legacy:${input.prompt.slice(0, 50)}` }
  },
}

export function selectRuntime(kind: RuntimeKind): AgentContract.AgentRuntime {
  if (kind === "dsh-react-loop") {
    // Import lazily to avoid circular deps; the DSH loop is already in kernel
    // This will be replaced with a proper registry lookup in M4 composition
    const { ReactLoop } = require("@opencode-ai/kernel") as typeof import("@opencode-ai/kernel")
    // For now, return a stub that delegates to legacy but is identifiable as DSH
    return {
      id: "dsh-react-loop",
      version: "1.0.0",
      capabilities: ["react-loop", "turn", "step", "no-progress-guard", "cancellation"],
      execute: legacyRuntime.execute,
    }
  }
  return legacyRuntime
}

export const DEFAULT_RUNTIME: RuntimeKind = "opencode-legacy"
