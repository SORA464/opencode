/**
 * M6-M7 — DSH Agent Loop integration behind M5 AgentContract
 */
import { reactLoop, makeReactAgent } from "@opencode-ai/kernel/src/agent-loop/react-loop"
import type { AgentInput, AgentOutput } from "@opencode-ai/kernel/src/agents/agent-contract"

export type DshAgentAdapter = {
  readonly id: string
  readonly execute: (input: AgentInput) => Promise<AgentOutput>
}

export function makeDshAgentLoop(): DshAgentAdapter {
  return makeReactAgent({
    provider: "opencode",
    model: "x-preview-f-free",
    systemPrompt: "You are a helpful coding assistant.",
    tools: [],
    stream: async function* () { yield { type: "done" as const, toolName: "stop" } },
    executeTool: async () => ({ ok: true, value: "ok" }),
  })
}
