/** K-M3 — Streaming contract */
export type StreamEvent = { type: "token"; text: string } | { type: "toolCall"; id: string; name: string; args: unknown } | { type: "done"; usage?: unknown } | { type: "error"; error: unknown }
export interface Stream { [Symbol.asyncIterator](): AsyncIterator<StreamEvent> }
