// tests/webnodebinding-dualSignalBind.test.ts
import { State } from "@denshya/reactive"
import { describe, expect, it } from "bun:test"

import WebNodeBinding from "../build/WebNodeBinding"

describe("WebNodeBinding.dualSignalBind", () => {
  it("binds input value from observable to DOM and back", () => {
    const state = new State("initial")
    const input = document.createElement("input")

    WebNodeBinding.dualSignalBind(input, "value", state, "input")

    // Initial value set from state
    expect(input.value).toBe("initial")

    // DOM update reflects in state
    input.value = "changed"
    input.dispatchEvent(new Event("input"))
    expect(state.get()).toBe("changed")

    // State update reflects in DOM
    state.set("updated")
    expect(input.value).toBe("updated")
  })

  it("does not bind if input is not observable", () => {
    const input = document.createElement("input")
    WebNodeBinding.dualSignalBind(input, "value", "static", "input")
    expect(input.value).toBe("")
  })

  it("throws for unsupported instance types", () => {
    const notNode = {} as unknown as Node
    const state = new State("x")
    expect(() =>
      WebNodeBinding.dualSignalBind(notNode, "textContent", state, "input")
    ).toThrow(TypeError)
  })

  it("throws if descriptor is missing", () => {
    const div = document.createElement("div")
    const state = new State("x")
    expect(() =>
      WebNodeBinding.dualSignalBind(div, "nonexistent" as any, state, "input")
    ).toThrow(TypeError)
  })

  it("memoizes native descriptor", () => {
    const input = document.createElement("input")
    const state = new State("memo")
    WebNodeBinding.dualSignalBind(input, "value", state, "input")

    // Set again with different observable
    const state2 = new State("second")
    WebNodeBinding.dualSignalBind(input, "value", state2, "input")
    expect(input.value).toBe("second")

    state.set("third")
    expect(input.value).toBe("third")
  })
})
