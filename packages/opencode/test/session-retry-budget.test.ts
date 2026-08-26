import { describe, expect, test } from "bun:test"
import { delay, retryBudgetMs, RETRY_INITIAL_DELAY, RETRY_BACKOFF_FACTOR, RETRY_MAX_DELAY_NO_HEADERS } from "@/session/retry"

describe("session retry hardening", () => {
  test("no-header backoff is capped at RETRY_MAX_DELAY_NO_HEADERS", () => {
    for (const attempt of [1, 2, 4, 8, 16, 64]) {
      expect(delay(attempt)).toBeLessThanOrEqual(RETRY_MAX_DELAY_NO_HEADERS)
    }
    expect(delay(1)).toEqual(RETRY_INITIAL_DELAY)
    expect(delay(2)).toEqual(RETRY_INITIAL_DELAY * RETRY_BACKOFF_FACTOR)
  })

  test("header-directed delays stay within the absolute cap", () => {
    const error = {
      type: "APIError",
      data: {
        statusCode: 429,
        message: "rate limited",
        isRetryable: true,
        responseHeaders: { "retry-after-ms": "99999999" },
      },
    } as never
    // Must remain finite and bounded by the 32-bit setTimeout ceiling.
    expect(delay(1, error)).toEqual(99_999_999)
  })

  test("retry budget defaults to 24h and honors env override", () => {
    const original = process.env.OPENCODE_RETRY_BUDGET_MS
    try {
      delete process.env.OPENCODE_RETRY_BUDGET_MS
      expect(retryBudgetMs()).toEqual(24 * 60 * 60 * 1000)

      process.env.OPENCODE_RETRY_BUDGET_MS = "45000"
      expect(retryBudgetMs()).toEqual(45_000)

      process.env.OPENCODE_RETRY_BUDGET_MS = "not-a-number"
      expect(retryBudgetMs()).toEqual(24 * 60 * 60 * 1000)

      process.env.OPENCODE_RETRY_BUDGET_MS = "-5"
      expect(retryBudgetMs()).toEqual(24 * 60 * 60 * 1000)
    } finally {
      if (original === undefined) delete process.env.OPENCODE_RETRY_BUDGET_MS
      else process.env.OPENCODE_RETRY_BUDGET_MS = original
    }
  })
})
