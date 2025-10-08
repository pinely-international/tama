import "./dom"

import { describe, expect, it } from "bun:test"

import WebInflator from "../src/Inflator/web/WebInflator"
import { ProtonComponent } from "../src/Proton/ProtonComponent"


function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe("View transitions", () => {
  it("keeps previous view until transition resolves", async () => {
    const inflator = new WebInflator()
    const component = new ProtonComponent(inflator)

    await component.view.setAsync("home")

    const enter = deferred<void>()
    const release = deferred<void>()

    component.view.transitions.clear()
    component.view.transitions.add(async (transit, previous, next) => {
      expect(previous).toBe("home")
      expect(next).toBe("profile")
      expect(component.view.transitions.state).toBe("running")
      expect(component.view.current).toBe("home")

      enter.resolve()
      await release.promise
      await transit()
    })

    const transitionPromise = component.view.setAsync("profile")

    expect(component.view.transitions.state).toBe("pending")
    expect(component.view.current).toBe("home")

    await enter.promise
    expect(component.view.current).toBe("home")

    release.resolve()
    await transitionPromise

    expect(component.view.current).toBe("profile")
    expect(component.view.transitions.state).toBe("idle")
    expect(component.view.transitions.snapshot).toBeNull()
  })

  it("binds document context for startViewTransition", async () => {
    const inflator = new WebInflator()
    const component = new ProtonComponent(inflator)

    await component.view.setAsync("before")

    const original = (document as any).startViewTransition
    let invocationContext: unknown
    let updateCallbackCalled = false

    ;(document as any).startViewTransition = function startViewTransition(callback: () => void) {
      invocationContext = this
      callback()
      updateCallbackCalled = true
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        committed: Promise.resolve(),
      }
    }

    component.view.transitions.clear()
    component.view.transitions.add(document.startViewTransition as any)

    await component.view.setAsync("after")

    expect(updateCallbackCalled).toBe(true)
    expect(invocationContext).toBe(document)

    ;(document as any).startViewTransition = original
  })

  it("runs transition handlers sequentially", async () => {
    const inflator = new WebInflator()
    const component = new ProtonComponent(inflator)

    await component.view.setAsync("initial")

    const firstRelease = deferred<void>()
    const secondRelease = deferred<void>()
    const log: string[] = []

    component.view.transitions.clear()
    component.view.transitions.add(async (transit: () => Promise<void>) => {
      log.push("first:start")
      await firstRelease.promise
      log.push("first:transit")
      await transit()
      log.push("first:after")
    })
    component.view.transitions.add(async (transit: () => Promise<void>) => {
      log.push("second:start")
      await secondRelease.promise
      log.push("second:transit")
      await transit()
      log.push("second:after")
    })

    const transitionPromise = component.view.setAsync("next")

    expect(component.view.transitions.state).toBe("pending")
  await Promise.resolve()
  expect(log).toEqual(["first:start"])

    firstRelease.resolve()
    await Promise.resolve()
    expect(log).toEqual(["first:start", "first:transit", "second:start"])
    expect(component.view.current).toBe("initial")

    secondRelease.resolve()
    await transitionPromise

    expect(log).toEqual([
      "first:start",
      "first:transit",
      "second:start",
      "second:transit",
      "second:after",
      "first:after",
    ])
    expect(component.view.current).toBe("next")
    expect(component.view.transitions.state).toBe("idle")
  })
})
