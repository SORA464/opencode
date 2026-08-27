/** K-M3 — Reasoning contract */
export interface Reasoning { readonly content?: string; readonly hidden?: boolean; readonly tokens?: number }
export function redactIfNeeded(r: Reasoning, allow: boolean): Reasoning | undefined { return allow ? r : undefined }
