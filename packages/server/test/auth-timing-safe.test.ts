import { describe, expect, test } from "bun:test"
import { Option, Redacted } from "effect"
import { ServerAuth } from "../src/auth"

const config = {
  password: Option.some("s3cret-value"),
  username: "opencode",
}

describe("ServerAuth.authorized timing-safe comparison", () => {
  test("accepts correct credentials", () => {
    expect(
      ServerAuth.authorized({ username: "opencode", password: Redacted.make("s3cret-value") }, config),
    ).toBe(true)
  })

  test("rejects wrong password regardless of length", () => {
    expect(ServerAuth.authorized({ username: "opencode", password: Redacted.make("x") }, config)).toBe(false)
    expect(
      ServerAuth.authorized(
        { username: "opencode", password: Redacted.make("s3cret-value-but-longer") },
        config,
      ),
    ).toBe(false)
  })

  test("rejects wrong username", () => {
    expect(ServerAuth.authorized({ username: "other", password: Redacted.make("s3cret-value") }, config)).toBe(
      false,
    )
  })

  test("rejects everything when no password configured", () => {
    const empty = { password: Option.none(), username: "opencode" }
    expect(
      ServerAuth.authorized({ username: "opencode", password: Redacted.make("s3cret-value") }, empty),
    ).toBe(false)
  })
})
