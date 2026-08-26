import { Effect } from "effect"
import { effectCmd } from "../effect-cmd"
import { withNetworkOptions, resolveNetworkOptions } from "../network"
import { Flag } from "@opencode-ai/core/flag/flag"

export const ServeCommand = effectCmd({
  command: "serve",
  builder: (yargs) => withNetworkOptions(yargs),
  describe: "starts a headless opencode server",
  // Server loads instances per-request via x-opencode-directory header — no
  // need for an ambient project InstanceContext at startup.
  instance: false,
  handler: Effect.fn("Cli.serve")(function* (args) {
    const { Server } = yield* Effect.promise(() => import("../../server/server"))
    const opts = yield* resolveNetworkOptions(args)
    if (!Flag.OPENCODE_SERVER_PASSWORD) {
      if (isLoopbackHostname(opts.hostname)) {
        console.log("Warning: OPENCODE_SERVER_PASSWORD is not set; server is unsecured.")
      } else if (process.env.OPENCODE_ALLOW_UNAUTHENTICATED_REMOTE === "1") {
        console.log(
          "Warning: OPENCODE_SERVER_PASSWORD is not set and the server binds a non-loopback address; " +
            "unauthenticated remote access is explicitly enabled via OPENCODE_ALLOW_UNAUTHENTICATED_REMOTE=1.",
        )
      } else {
        console.error(
          `Refusing to bind non-loopback hostname "${opts.hostname}" without credentials. ` +
            "Set OPENCODE_SERVER_PASSWORD/OPENCODE_SERVER_USERNAME, or set " +
            "OPENCODE_ALLOW_UNAUTHENTICATED_REMOTE=1 to accept unauthenticated remote access.",
        )
        return yield* Effect.sync(() => process.exit(2))
      }
    }
    const server = yield* Effect.promise(() => Server.listen(opts))
    console.log(`opencode server listening on http://${server.hostname}:${server.port}`)

    yield* Effect.never
  }),
})

function isLoopbackHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "")
  return (
    normalized === "localhost" ||
    normalized === "::1" ||
    normalized.startsWith("127.") ||
    normalized === "[::1]"
  )
}
