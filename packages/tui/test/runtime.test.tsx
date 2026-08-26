import { expect, test } from "bun:test"
import path from "path"
import { testRender } from "@opentui/solid"
import { abbreviateHome } from "../src/runtime"
import { TuiPathsProvider, useTuiPaths } from "../src/context/runtime"

// Build platform-native fixtures so the invariants hold on both POSIX and
// Windows path semantics (path.relative is platform-dependent).
const sep = path.sep
const home = path.resolve(path.sep, "home", "test")
const inside = path.join(home, "project")
const outsideSibling = path.resolve(home, "..", "tester", "project")
const unrelated = path.resolve(path.sep, "tmp", "project")

test("abbreviates paths within home boundaries", () => {
  expect(abbreviateHome(home, home)).toBe("~")
  expect(abbreviateHome(inside, home)).toBe("~" + sep + "project")
  // A sibling directory that merely shares a prefix must not be abbreviated.
  expect(abbreviateHome(outsideSibling, home)).toBe(outsideSibling)
  expect(abbreviateHome(unrelated, home)).toBe(unrelated)
})

test("provides focused immutable runtime inputs", async () => {
  let paths: ReturnType<typeof useTuiPaths>

  function Runtime() {
    paths = useTuiPaths()
    return <text>{paths.cwd}</text>
  }

  const app = await testRender(
    () => (
      <TuiPathsProvider value={{ cwd: "/work", home: "/home/test", state: "/state", worktree: "/worktree" }}>
        <Runtime />
      </TuiPathsProvider>
    ),
    { width: 40, height: 3 },
  )

  try {
    await app.renderOnce()
    expect(app.captureCharFrame()).toContain("/work")
    expect(Object.isFrozen(paths!)).toBe(true)
  } finally {
    app.renderer.destroy()
  }
})
