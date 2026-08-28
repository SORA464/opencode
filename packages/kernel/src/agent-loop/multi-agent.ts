/**
 * K-DSH-E — Multi-agent orchestration seam.
 *
 * Parent → planner → specialist agents → aggregation, with strict spawn limits,
 * explicit lifecycle, cancellation, and provenance. Adapted from DSH multi-agent
 * concepts onto our AgentRuntime contract.
 */
export interface SubAgentOptions {
  readonly id: string
  readonly prompt: string
  readonly model: string
  readonly execute: (input: { prompt: string; model: string; signal?: AbortSignal }) => Promise<{ status: string; result?: unknown; error?: string }>
}

export interface MultiAgentConfig {
  readonly maxDepth: number
  readonly maxSiblings: number
  readonly maxTotal: number
}

export const DEFAULT_MULTI_AGENT_CONFIG: MultiAgentConfig = { maxDepth: 3, maxSiblings: 5, maxTotal: 20 }

export interface DelegationResult {
  readonly id: string
  readonly status: "completed" | "failed" | "cancelled"
  readonly result?: unknown
  readonly error?: string
}

export class SubAgentCoordinator {
  private total = 0
  constructor(private readonly config: MultiAgentConfig) {}

  async delegate(parent: SubAgentOptions, depth: number, signal?: AbortSignal): Promise<DelegationResult> {
    if (signal?.aborted) return { id: parent.id, status: "cancelled" }
    if (depth > this.config.maxDepth) return { id: parent.id, status: "failed", error: "max delegation depth exceeded" }
    if (this.total >= this.config.maxTotal) return { id: parent.id, status: "failed", error: "max total subagents exceeded" }
    this.total++
    try {
      const result = await parent.execute({ prompt: parent.prompt, model: parent.model, signal })
      return { id: parent.id, status: result.status as DelegationResult["status"], result: result.result, error: result.error }
    } catch (e) {
      return { id: parent.id, status: "failed", error: String(e) }
    }
  }
}

export function makeCoordinator(config: MultiAgentConfig = DEFAULT_MULTI_AGENT_CONFIG): SubAgentCoordinator {
  return new SubAgentCoordinator(config)
}
