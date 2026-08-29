/**
 * Agent Loop service (authoritative, kernel-owned)
 * Provides DSH-derived ReactLoop as a service, selectable via composition.
 * Old OpenCode loop remains as fallback.
 */
import { makeReactAgent } from "@opencode-ai/kernel/agent-loop/react-loop"
import { Context, Layer } from "effect"
import { makeLocationNode } from "@opencode-ai/core/effect/app-node"

export class AgentLoopService extends Context.Service<AgentLoopService, ReturnType<typeof makeReactAgent>>()("@opencode/AgentLoop") {}

export const node = makeLocationNode({
  service: AgentLoopService,
  layer: Layer.succeed(
    AgentLoopService,
    makeReactAgent({
      provider: "opencode",
      model: "x-preview-f-free",
      systemPrompt: "You are a helpful coding assistant.",
      tools: [],
      stream: async function* () { yield { type: "done" as const, toolName: "stop" } },
      executeTool: async () => ({ ok: true, value: "ok" }),
    }),
  ),
  deps: [],
})
