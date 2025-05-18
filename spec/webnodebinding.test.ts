import "./dom"

import { afterEach, beforeEach, describe, expect, it } from "bun:test"

import { injectDOMPolyfill } from "./dom"

import Accessor from "../src/Accessor"
import WebNodeBinding from "../src/utils/WebNodeBinding"

describe("WebNodeBinding.dualSignalBind", () => {
  let input: HTMLInputElement
  let origExtract: typeof Accessor.extractObservable

  beforeEach(() => {
    injectDOMPolyfill(globalThis)
    document.body.innerHTML = "<div id='test' />"
    input = document.getElementById("test") as HTMLInputElement

    // backup and stub Accessor.extractObservable
    origExtract = Accessor.extractObservable
  })

  afterEach(() => {
    // restore
    Accessor.extractObservable = origExtract
  })

  it("returns early when value is not observable", () => {
    let called = false
    Accessor.extractObservable = v => { called = true; return null }
    WebNodeBinding.dualSignalBind(input, "value", "plain", "input")
    expect(called).toBe(true)
    // property should remain unchanged
    expect(input.value).toBe("")
  })

  it("initializes node property from accessor.get", () => {
    const accessor = {
      get: () => "hello",
      set: undefined,
      subscribe: undefined,
    }
    Accessor.extractObservable = () => accessor
    WebNodeBinding.dualSignalBind(input, "value", {}, "input")
    expect(input.value).toBe("hello")
  })

  it("wires setter to accessor.set and maintains native behavior", () => {
    const calls: unknown[] = []
    const accessor = {
      get: () => "x",
      set: (v: unknown) => calls.push(v),
      subscribe: undefined,
    }
    Accessor.extractObservable = () => accessor
    WebNodeBinding.dualSignalBind(input, "value", {}, "input")

    // setting input.value should call both descriptor.set and accessor.set
    input.value = "world"
    expect(input.value).toBe("world")
    expect(calls).toEqual(["world"])
  })

  it("listens to changeEventKey and propagates to accessor.set", () => {
    let last: unknown
    const accessor = {
      get: () => "",
      set: (v: unknown) => { last = v },
      subscribe: undefined,
    }
    Accessor.extractObservable = () => accessor
    WebNodeBinding.dualSignalBind(input, "value", {}, "change")

    // simulate user interaction
    input.value = "typed"
    input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(last).toBe("typed")
  })

  it("subscribes to accessor.subscribe to update node property", () => {
    let subCb: (v: unknown) => void = () => { }
    const accessor = {
      get: () => undefined,
      set: undefined,
      subscribe: (cb: (v: unknown) => void) => { subCb = cb },
    }
    Accessor.extractObservable = () => accessor
    WebNodeBinding.dualSignalBind(input, "value", {}, "input")

    // before subscription, default
    expect(input.value).toBe("")
    // trigger subscription
    subCb("newval")
    expect(input.value).toBe("newval")
  })

  it("throws when non-Node instance passed to getNativeDescriptor", () => {
    // bypass dualSignalBind to call underlying getNativeDescriptor
    const fn = () => (WebNodeBinding as any).getNativeDescriptor({}, "value")
    expect(fn).toThrow(TypeError)
  })

  it("throws when property not on prototype", () => {
    // create fake node without 'foo'
    Accessor.extractObservable = () => ({ get: () => 1 })
    const fake = document.createElement("div")
    const bind = () => WebNodeBinding.dualSignalBind(fake, "foo" as any, {}, "input")
    expect(bind).toThrow(TypeError)
  })
})
