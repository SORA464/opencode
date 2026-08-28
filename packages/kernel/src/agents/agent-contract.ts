/**
 * K-M5 — Agent runtime contract (canonical)
 */
export interface AgentRuntime {
  readonly id: string
  readonly version: string
  readonly capabilities: ReadonlyArray<string>
  readonly execute: (input: AgentInput) => Promise<AgentOutput>
}

export interface AgentInput {
  readonly sessionID: string
  readonly prompt: string
  readonly model: string
  readonly tools: ReadonlyArray<string>
  readonly context: Record<string, unknown>
}

export interface AgentOutput {
  readonly status: "completed" | "failed" | "cancelled"
  readonly result?: unknown
  readonly error?: string
}

export const KERNEL_AGENT_API_VERSION = "1" as const
