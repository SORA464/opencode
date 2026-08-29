/**
 * M6-M7 — DSH Agent Loop integration behind M5 AgentContract
 */
import { ReactLoop, AgentContract } from "@opencode-ai/kernel"

export type DshAgentAdapter = {
  readonly id: string
  readonly execute: (input: AgentContract.AgentInput) => Promise<AgentContract.AgentOutput>
}

export function makeDshAgentLoop(): DshAgentAdapter {
  return ReactLoop.makeReactAgent({
    provider: "opencode",
    model: "x-preview-f-free",
    systemPrompt: "You are a helpful coding assistant.",
    tools: [],
    stream: async function* () { yield { type: "done" as const, toolName: "stop" } },
    executeTool: async () => ({ ok: true, value: "ok" }),
  })
}
