/**
 * K-M5 — Agent turn contract
 */
export interface Turn { readonly id: string; readonly agentId: string; readonly status: "pending" | "running" | "completed" | "failed" | "cancelled"; readonly steps: ReadonlyArray<string> }
export type TurnTransition = { from: Turn["status"]; to: Turn["status"]; valid: boolean }
