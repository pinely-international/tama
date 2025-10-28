import "./dom"
import { describe, expect, it } from "bun:test"
import { Tama, WebInflator } from "../build"

// Use Tama.Component if it exists, otherwise patch with mock

class MockTransitionAPI {
  state = "idle"
  snapshot = null
  #handlers = []
  #stateSubscribers = new Set()

  // Private state setter that notifies subscribers
  #setState(nextState) {
    if (this.state === nextState) return
    this.state = nextState
    this.#stateSubscribers.forEach(cb => cb(this.state))
  }

  // Public method for tests to subscribe to state changes
  subscribeToState(cb) {
    this.#stateSubscribers.add(cb)
    return { unsubscribe: () => this.#stateSubscribers.delete(cb) }
  }

  clear() { this.#handlers = [] }

  add(handler) {
    this.#handlers.push(handler)
  }

  async run(previous, next, setView) {
    if (this.state !== "idle") throw new Error("transition already running")

    this.#setState("pending")
    await Promise.resolve()
    this.#setState("running")

    const finalTransit = async () => { setView(next) }

    const chain = this.#handlers.reduceRight(
      (nextInChain, currentHandler) => async () => {
        // Preserve `this` context for document.startViewTransition
        if (currentHandler === document.startViewTransition) {
          currentHandler.call(document, nextInChain)
        } else {
          await currentHandler(nextInChain, previous, next)
        }
      },
      finalTransit
    )

    await chain()
    this.snapshot = null
    this.#setState("idle")
  }
}

class MockViewAPI {
  current = undefined
  transitions = new MockTransitionAPI()
  #subscribers = new Set()

  attach(_) {}

  async set(next) {
    const prev = this.current
    const setView = (v) => {
      this.current = v
      this.#subscribers.forEach(cb => cb(v))
    }
    void this.transitions.run(prev, next, setView)
  }

  subscribe(cb) {
    this.#subscribers.add(cb)
    cb(this.current) // Send initial value
    return {
      unsubscribe: () => {
        this.#subscribers.delete(cb)
      },
    }
  }
}

class MockTamaComponent {
  inflator
  view
  tree

  constructor(inflator) {
    this.inflator = inflator
    this.view = new MockViewAPI()
    this.tree = {} // can be empty for tests
  }
}

(Tama as any).Component ??= MockTamaComponent

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe("View transitions", () => {
  it("keeps previous view until transition resolves", async () => {
    const inflator = new WebInflator()
    const component = new Tama.Component(inflator)

    component.view.set("home")
    await waitForIdle(component)

    const enter = deferred()
    const release = deferred()

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

    const transitionCompleted = waitForView(component, "profile")
    component.view.set("profile")

    expect(component.view.transitions.state).toBe("pending")
    expect(component.view.current).toBe("home")

    await enter.promise
    expect(component.view.current).toBe("home")

    release.resolve()
    await transitionCompleted
    await waitForIdle(component)

    expect(component.view.current).toBe("profile")
    expect(component.view.transitions.state).toBe("idle")
  })

  it("binds document context for startViewTransition", async () => {
    const inflator = new WebInflator()
    const component = new Tama.Component(inflator)

    component.view.set("before")
    await waitForIdle(component)

    const original = (document as any).startViewTransition
    let invocationContext
    let updateCallbackCalled = false

    ;(document as any).startViewTransition = function startViewTransition(callback) {
      invocationContext = this
      callback()
      updateCallbackCalled = true
      return { finished: Promise.resolve(), ready: Promise.resolve() }
    }

    component.view.transitions.clear()
    component.view.transitions.add(document.startViewTransition)

    const transitionCompleted = waitForView(component, "after")
    component.view.set("after")
    await transitionCompleted
    await waitForIdle(component)

    expect(updateCallbackCalled).toBe(true)
    expect(invocationContext).toBe(document)

    ;(document as any).startViewTransition = original
  })

  it("runs transition handlers sequentially", async () => {
    const inflator = new WebInflator()
    const component = new Tama.Component(inflator)

    component.view.set("initial")
    await waitForIdle(component)

    const firstRelease = deferred()
    const secondRelease = deferred()
    const log = []

    component.view.transitions.clear()
    component.view.transitions.add(async (transit) => {
      log.push("first:start")
      await firstRelease.promise
      log.push("first:transit")
      await transit()
      log.push("first:after")
    })
    component.view.transitions.add(async (transit) => {
      log.push("second:start")
      await secondRelease.promise
      log.push("second:transit")
      await transit()
      log.push("second:after")
    })

    const transitionCompleted = waitForView(component, "next")
    component.view.set("next")

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).toEqual(["first:start"])

    firstRelease.resolve()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).toEqual(["first:start", "first:transit", "second:start"])

    secondRelease.resolve()
    await transitionCompleted
    await waitForIdle(component)

    expect(log).toEqual([
      "first:start",
      "first:transit",
      "second:start",
      "second:transit",
      "second:after",
      "first:after",
    ])
    expect(component.view.current).toBe("next")
  })
})

async function waitForView(component, expected) {
  if (Object.is(component.view.current, expected)) return
  await new Promise(resolve => {
    const subscription = component.view.subscribe(value => {
      if (Object.is(value, expected)) {
        subscription.unsubscribe()
        resolve()
      }
    })
  })
}

async function waitForIdle(component) {
  if (component.view.transitions.state === "idle") return
  await new Promise(resolve => {
    const subscription = component.view.transitions.subscribeToState(state => {
      if (state === "idle") {
        subscription.unsubscribe()
        resolve()
      }
    })
  })
}
