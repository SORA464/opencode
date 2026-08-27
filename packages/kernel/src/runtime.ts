/**
 * K1 — Runtime substrate
 * Thin, versioned wrapper around the existing Effect LayerNode substrate.
 * In M1 this is purely additive: it re-exports the battle-tested
 * `packages/core/src/effect/layer-node` machinery under kernel versioning
 * so future phases can depend on kernel, not on core internals directly.
 *
 * Compatibility: old imports (`@opencode-ai/core/effect/layer-node`) keep working
 * via the compatibility bridge (see `compatibility.ts`).
 */
import * as CoreLayerNode from "@opencode-ai/core/effect/layer-node"
import { Context, Effect, Layer, ManagedRuntime } from "effect"

export const LayerNode = CoreLayerNode.LayerNode
export const make = CoreLayerNode.make
export const unbound = CoreLayerNode.unbound
export const group = CoreLayerNode.group
export const compile = CoreLayerNode.compile
export const hoist = CoreLayerNode.hoist
export const hasUnbound = CoreLayerNode.hasUnbound
export const tags = CoreLayerNode.tags

export type Node<A, E, T extends Tag | undefined = Tag | undefined> = CoreLayerNode.Node<A, E, T>
export type Tag<Name extends string = string> = CoreLayerNode.Tag<Name>

export function makeRuntime<A, E>(layer: Layer.Layer<A, E>) {
  return ManagedRuntime.make(layer)
}

export function runPromise<A, E>(runtime: ManagedRuntime.ManagedRuntime<A, E>) {
  return <R, Err, Out>(effect: Effect.Effect<Out, Err, R>) =>
    runtime.runPromise(effect as Effect.Effect<Out, Err, R & A>)
}

export * as Runtime from "./runtime"
