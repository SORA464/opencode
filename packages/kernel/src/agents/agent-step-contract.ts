/**
 * K-M5 — Agent step contract (smallest execution unit)
 */
export interface Step {
  readonly id: string; readonly agentId: string; readonly parentTask?: string;
  readonly timestamp: number; readonly input: unknown; readonly action: string;
  readonly output?: unknown; readonly status: "pending" | "running" | "completed" | "failed" | "cancelled";
  readonly error?: string; readonly retryState?: { attempt: number; budgetMs: number }; readonly provenance?: Record<string, unknown>
}
