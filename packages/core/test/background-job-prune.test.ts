import { describe, expect, test } from "bun:test"
import { pruneFinished, FINISHED_JOB_MAX } from "@opencode-ai/core/background-job"

type FakeJob = {
  info: { status: string; completed_at?: number }
  token: object
}

function job(status: string, completed_at?: number): FakeJob {
  return { info: { status, completed_at }, token: {} }
}

describe("background-job pruneFinished", () => {
  test("keeps running and fresh finished jobs", () => {
    const now = 10_000
    const jobs = new Map<string, FakeJob>([
      ["running", job("running")],
      ["fresh", job("completed", now - 1000)],
    ])
    const { map, removed } = pruneFinished(jobs, now)
    expect(removed).toEqual([])
    expect([...map.keys()].sort()).toEqual(["fresh", "running"])
  })

  test("evicts finished jobs past the retention window", () => {
    const now = 10_000_000
    const retention = 60 * 60 * 1000
    const jobs = new Map<string, FakeJob>([
      ["old", job("completed", now - retention - 1)],
      ["boundary", job("completed", now - retention)],
      ["new", job("error", now - retention + 1000)],
      ["live", job("running")],
    ])
    const { map, removed } = pruneFinished(jobs, now, retention)
    expect(removed.sort()).toEqual(["boundary", "old"])
    expect([...map.keys()].sort()).toEqual(["live", "new"])
  })

  test("hard-caps retained finished jobs, evicting oldest first", () => {
    const now = 10_000
    const jobs = new Map<string, FakeJob>()
    for (let i = 0; i < FINISHED_JOB_MAX + 5; i++) {
      jobs.set(`j${i}`, job("completed", i))
    }
    jobs.set("live", job("running"))
    const { map, removed } = pruneFinished(jobs, now, Number.MAX_SAFE_INTEGER)
    // Capacity for finished entries is reduced by live ones.
    expect(map.size).toEqual(FINISHED_JOB_MAX)
    expect(removed.length).toEqual(6)
    // Oldest completed_at values were evicted.
    expect(removed.sort()).toEqual(["j0", "j1", "j2", "j3", "j4", "j5"].sort())
  })

  test("re-started job with same id survives when running again", () => {
    const now = 10_000
    const jobs = new Map<string, FakeJob>([["same-id", job("running")]])
    const { map, removed } = pruneFinished(jobs, now - 999_999_999)
    expect(removed).toEqual([])
    expect(map.has("same-id")).toBe(true)
  })
})
