/** K-M3 — Structured output contract */
export function validate<T>(_schema: unknown, value: unknown): T | { error: string } {
  return value as T
}
