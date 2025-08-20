import "./dom"

import { beforeEach, describe, expect, it } from "bun:test"

import WebInflator from "../src/Inflator/web/WebInflator"
import { ProtonComponent } from "../src/Proton/ProtonComponent"
import TreeContextAPI from "../src/TreeContextAPI"

describe("ProtonComponent", () => {
  let rootComponent: ProtonComponent
  let inflator: WebInflator

  beforeEach(() => {
    inflator = new WebInflator()
    rootComponent = new ProtonComponent(inflator)
  })

  it("initializes view, context, and inflator.clone", () => {
    expect(rootComponent.view).toHaveProperty("set")
    expect(rootComponent.tree.context).toBeInstanceOf(TreeContextAPI)
    // cloned inflator has same API
    expect(rootComponent.inflator).not.toBe(inflator)
    expect(rootComponent.inflator).toHaveProperty("inflate")
  })

  // it("view.set dispatches only on new subject", () => {
  //   const calls: unknown[] = []
  //   rootComponent.view.subscribe(v => calls.push(v))
  //   const subj = { foo: 1 }
  //   rootComponent.view.set(subj)
  //   rootComponent.view.set(subj)
  //   expect(calls.length).toBe(1)
  // })

  // it("when(event) returns observable for mount/unmount", () => {
  //   const mounts: unknown[] = []
  //   rootComponent.view.subscribe(() => mounts.push(true))
  //   // trigger mount via use()
  //   rootComponent.view.life.adopt(view => {
  //     expect(view).toBeEmpty()
  //     return () => mounts.push(false)
  //   })
  //   // simulate mount
  //   rootComponent.events.dispatch("mount")
  //   // simulate unmount
  //   rootComponent.events.dispatch("unmount")
  //   expect(mounts).toEqual([true, false])
  // })

  it("static evaluate handles sync, async, and generator factories", async () => {
    // sync factory
    const component = new ProtonComponent(inflator)
    await component.view.initWith(function sync() { return "A" }())
    expect(component.view.current).toBe("A")

    // async factory
    await component.view.initWith((async () => "B")())
    expect(component.view.current).toBe("B")

    // generator factory
    await component.view.initWith(async function* gen() {
      yield "X"
      yield "Y"
      return "Z"
    }())
    expect(component.view.current).toBe("Z")
  })
})
