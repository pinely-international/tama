import "./dom"

import { beforeEach, describe, expect, it } from "bun:test"

import WebInflator from "../src/Inflator/web/WebInflator"
import { ProtonComponent } from "../src/Proton/ProtonComponent"
import TreeContextAPI from "../src/TreeContextAPI"

describe("ProtonComponent", () => {
  let rootComp: ProtonComponent
  let inflator: WebInflator

  beforeEach(() => {
    inflator = new WebInflator()
    rootComp = new ProtonComponent(inflator)
  })

  it("initializes view, context, and inflator.clone", () => {
    expect(rootComp.view).toHaveProperty("set")
    expect(rootComp.view).toHaveProperty("setPrevious")
    expect(rootComp.context).toBeInstanceOf(TreeContextAPI)
    // cloned inflator has same API
    expect(rootComp.inflator).not.toBe(inflator)
    expect(rootComp.inflator).toHaveProperty("inflate")
  })

  it("view.set renders only on new subject", () => {
    const calls: unknown[] = []
    rootComp.events.when("view").subscribe(v => calls.push(v))
    const subj = { foo: 1 }
    rootComp.view.set(subj)
    rootComp.view.set(subj)
    expect(calls.length).toBe(1)
  })

  it("view.setPrevious restores previous view", () => {
    const first = document.createElement("div")
    const second = document.createElement("div")

    rootComp.events.when("view").subscribe(() => { })
    rootComp.view.set(first)
    expect(rootComp.getView()).toEqual(first)

    rootComp.view.set(second)
    expect(rootComp.getView()).toEqual(second)

    rootComp.view.setPrevious()
    expect(rootComp.getView()).toEqual(first)
  })

  it("ProtonComponent.evaluate throws error on error", () => {
    const component = new ProtonComponent(inflator)
    const componentFactoryErrored = () => { throw new Error("test") }

    expect(() => ProtonComponent.evaluate(component, componentFactoryErrored)).toThrow()
  })

  it("ProtonComponent.evaluate intercepts thrown errors", () => {
    const component = new ProtonComponent(inflator)
    const componentFactoryErrored = () => { throw new Error("test") }

    let caught
    component.catch(error => caught = error)

    expect(() => ProtonComponent.evaluate(component, componentFactoryErrored)).not.toThrow()
    expect(caught).toBeInstanceOf(Error)
  })

  it("when(event) returns observable for mount/unmount", () => {
    const mounts: unknown[] = []
    rootComp.events.when("mount").subscribe(() => mounts.push(true))
    rootComp.events.when("unmount").subscribe(() => mounts.push(false))
    // simulate mount
    rootComp.events.dispatch("mount")
    // simulate unmount
    rootComp.events.dispatch("unmount")
    expect(mounts).toEqual([true, false])
  })

  it("static evaluate handles sync, async, and generator factories", async () => {
    // sync factory
    const comp1 = new ProtonComponent(inflator)
    await ProtonComponent.evaluate(comp1, function sync() { return "A" })
    expect(comp1.getView()).toBeDefined()

    // async factory
    const comp2 = new ProtonComponent(inflator)
    await ProtonComponent.evaluate(comp2, async () => "B")
    expect(comp2.getView()).toBeDefined()

    // generator factory
    const comp3 = new ProtonComponent(inflator)
    await ProtonComponent.evaluate(comp3, function* gen() {
      yield "X"
      yield "Y"
    })
    expect(comp3.getView()).toBeDefined()
  })
})
