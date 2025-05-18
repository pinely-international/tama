// tests/protonjsx.test.ts
import { describe, expect, it } from "bun:test"

import ProtonJSX from "../src/jsx/ProtonJSX"

describe("ProtonJSX.Node & Element", () => {
  it("Node constructor assigns type and props", () => {
    const n = new ProtonJSX.Node("foo" as any, { a: 1 } as any)
    expect(n.type).toBe("foo")
    expect(n.props).toEqual({ a: 1 })
  })

  it("Element merges props when given existing Node", () => {
    const base = new ProtonJSX.Node("bar" as any, { x: 1 } as any)
    const merged = ProtonJSX.Element(base, { y: 2 } as any)
    expect(merged).toBe(base)
    expect(merged.props).toEqual({ x: 1, y: 2 })
  })

  it("Element with string returns Intrinsic node", () => {
    const intrinsic = ProtonJSX.Element("div", { id: "test" })

    console.log({ ...intrinsic })

    expect(intrinsic).toBeInstanceOf(ProtonJSX.Intrinsic)
    expect(intrinsic).toEqual({ type: "div", props: { id: "test" } })
  })

  it("Element with Symbol returns Intrinsic node", () => {
    const sym = Symbol.for("custom")
    const intr = ProtonJSX.Element(sym, { foo: "bar" })

    expect(intr).toBeInstanceOf(ProtonJSX.Intrinsic)
    expect(intr.type).toBe(sym)
    expect(intr.props).toEqual({ foo: "bar" })
  })

  it("Element with FragmentSymbol returns Fragment node", () => {
    const frag = ProtonJSX.Element(ProtonJSX.FragmentSymbol, { children: [] })

    expect(frag).toBeInstanceOf(ProtonJSX.Fragment)
    expect(frag.props).toEqual({ children: [] })
  })

  it("Element with function returns Component node", () => {
    function MyComp() { return null }
    const comp = ProtonJSX.Element(MyComp, { foo: 123 })

    expect(comp).toBeInstanceOf(ProtonJSX.Component)
    expect(comp.type).toBe(MyComp)
    expect(comp.props).toEqual({ foo: 123 })
  })

  it("Intrinsic extends Node and has correct prototypes", () => {
    const intr = new ProtonJSX.Intrinsic("span", { className: "c" })
    expect(intr).toBeInstanceOf(ProtonJSX.Node)
    expect(intr).toBeInstanceOf(ProtonJSX.Intrinsic)
  })

  it("Component extends Node and has correct prototypes", () => {
    function C() { }
    const comp = new ProtonJSX.Component(C, {})
    expect(comp).toBeInstanceOf(ProtonJSX.Node)
    expect(comp).toBeInstanceOf(ProtonJSX.Component)
  })

  it("Fragment extends Node and has correct prototypes", () => {
    const frag = new ProtonJSX.Fragment(ProtonJSX.FragmentSymbol, null)
    expect(frag).toBeInstanceOf(ProtonJSX.Node)
    expect(frag).toBeInstanceOf(ProtonJSX.Fragment)
  })
})
