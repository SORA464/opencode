import { test, expect, describe, afterEach } from "bun:test"
import { createServer } from "http"
import { McpOAuthCallback } from "../../src/mcp/oauth-callback"
import { parseRedirectUri } from "../../src/mcp/oauth-provider"

describe("parseRedirectUri", () => {
  test("returns defaults when no URI provided", () => {
    const result = parseRedirectUri()
    expect(result.port).toBe(19876)
    expect(result.path).toBe("/mcp/oauth/callback")
  })

  test("parses port and path from URI", () => {
    const result = parseRedirectUri("http://127.0.0.1:8080/oauth/callback")
    expect(result.port).toBe(8080)
    expect(result.path).toBe("/oauth/callback")
  })

  test("returns defaults for invalid URI", () => {
    const result = parseRedirectUri("not-a-valid-url")
    expect(result.port).toBe(19876)
    expect(result.path).toBe("/mcp/oauth/callback")
  })
})

describe("McpOAuthCallback.ensureRunning", () => {
  afterEach(async () => {
    await McpOAuthCallback.stop()
  })

  test("starts server with custom redirectUri port and path", async () => {
    await McpOAuthCallback.ensureRunning("http://127.0.0.1:18000/custom/callback")
    expect(McpOAuthCallback.isRunning()).toBe(true)
  })
})

describe("McpOAuthCallback lifecycle", () => {
  afterEach(async () => {
    await McpOAuthCallback.stop()
  })

  test("stops after a successful callback response completes", async () => {
    const port = await availablePort()
    await McpOAuthCallback.ensureRunning(`http://127.0.0.1:${port}/callback`)
    const callback = McpOAuthCallback.waitForCallback("success")

    const response = await fetch(`http://127.0.0.1:${port}/callback?code=code&state=success`)

    expect(response.status).toBe(200)
    expect(await callback).toBe("code")
    await waitForStop()
  })

  test("stops after a provider error", async () => {
    const port = await availablePort()
    await McpOAuthCallback.ensureRunning(`http://127.0.0.1:${port}/callback`)
    const callback = McpOAuthCallback.waitForCallback("provider-error")
    const error = callback.catch((cause) => cause)

    const response = await fetch(
      `http://127.0.0.1:${port}/callback?error=access_denied&error_description=Denied&state=provider-error`,
    )

    expect(response.status).toBe(200)
    await response.text()
    expect(await error).toEqual(new Error("Denied"))
    await waitForStop()
  })

  test("stops after cancellation", async () => {
    const port = await availablePort()
    await McpOAuthCallback.ensureRunning(`http://127.0.0.1:${port}/callback`)
    const callback = McpOAuthCallback.waitForCallback("cancelled", "server")

    McpOAuthCallback.cancelPending("server")

    await expect(callback).rejects.toThrow("Authorization cancelled")
    await waitForStop()
  })

  test("stops when cancellation races listener startup", async () => {
    const port = await availablePort()
    const callback = McpOAuthCallback.waitForCallback("cancelled", "starting-server")
    const starting = McpOAuthCallback.ensureRunning(`http://127.0.0.1:${port}/callback`)

    McpOAuthCallback.cancelPending("starting-server")

    await expect(callback).rejects.toThrow("Authorization cancelled")
    await starting
    await waitForStop()
  })

  test("stops after timeout", async () => {
    const port = await availablePort()
    await McpOAuthCallback.ensureRunning(`http://127.0.0.1:${port}/callback`)
    const callback = McpOAuthCallback.waitForCallback("timeout", undefined, 10)

    await expect(callback).rejects.toThrow("OAuth callback timeout")
    await waitForStop()
  })

  test("stays running until all simultaneous callbacks settle", async () => {
    const port = await availablePort()
    const redirectUri = `http://127.0.0.1:${port}/callback`
    await Promise.all([McpOAuthCallback.ensureRunning(redirectUri), McpOAuthCallback.ensureRunning(redirectUri)])
    const first = McpOAuthCallback.waitForCallback("first")
    const second = McpOAuthCallback.waitForCallback("second")

    await fetch(`${redirectUri}?code=one&state=first`)
    expect(await first).toBe("one")
    expect(McpOAuthCallback.isRunning()).toBe(true)

    await fetch(`${redirectUri}?code=two&state=second`)
    expect(await second).toBe("two")
    await waitForStop()
  })

  test("restarts when a callback is registered during shutdown", async () => {
    const port = await availablePort()
    const redirectUri = `http://127.0.0.1:${port}/callback`
    await McpOAuthCallback.ensureRunning(redirectUri)
    const first = McpOAuthCallback.waitForCallback("first")

    await fetch(`${redirectUri}?code=one&state=first`)
    expect(await first).toBe("one")

    const second = McpOAuthCallback.waitForCallback("second")
    await McpOAuthCallback.ensureRunning(redirectUri)
    const response = await fetch(`${redirectUri}?code=two&state=second`)

    expect(response.status).toBe(200)
    expect(await second).toBe("two")
    await waitForStop()
  })
})

async function availablePort() {
  const probe = createServer()
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve))
  const address = probe.address()
  if (!address || typeof address === "string") throw new Error("Failed to allocate callback test port")
  await new Promise<void>((resolve) => probe.close(() => resolve()))
  return address.port
}

async function waitForStop() {
  for (let attempt = 0; attempt < 50 && McpOAuthCallback.isRunning(); attempt++) await Bun.sleep(10)
  expect(McpOAuthCallback.isRunning()).toBe(false)
}
