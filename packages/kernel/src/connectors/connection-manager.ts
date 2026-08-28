/**
 * M7 — Connection manager (User Connection = separate from Definition)
 */
import type { UserConnection } from "./connector-registry"

export class ConnectionManager {
  private readonly conns = new Map<string, UserConnection>()
  connect(c: UserConnection): void { this.conns.set(c.id, c) }
  disconnect(id: string): void {
    const c = this.conns.get(id)
    if (c) this.conns.set(id, { ...c, status: "disconnected" })
  }
  revoke(id: string): void { this.conns.delete(id) }
  get(id: string): UserConnection | undefined { return this.conns.get(id) }
  health(id: string): "healthy" | "expired" | "unknown" {
    const c = this.conns.get(id)
    if (!c) return "unknown"
    return c.status === "expired" ? "expired" : "healthy"
  }
}
