import { EventSignal } from "@denshya/reactive"

import { AsyncGeneratorPrototype } from "./BuiltinObjects"
import { Life } from "./Life"
import TransitionAPI, { type ViewTransitionEntry } from "./TransitionAPI"


class ViewAPI extends EventSignal<unknown> {
  readonly life = new Life

  declare default: unknown

  private readonly transitionsApi = new TransitionAPI
  private transitionQueue: Promise<void> = Promise.resolve()

  constructor() {
    super(null)
  }

  transitions?: Iterable<(callback: () => void) => void | Promise<void>>

  async setIterable(iterable: Iterator<unknown> | AsyncIterator<unknown>) {
    let yieldResult: IteratorResult<unknown> = { done: false, value: undefined }
    while (yieldResult.done === false) {
      yieldResult = await iterable.next()
      await this.scheduleTransition(yieldResult.value)
    }
  }

  set(value: unknown) {
    void this.scheduleTransition(value)
  }

  /** @internal */
  async initWith(returnResult: unknown) {
    if (returnResult == null) return
    if (returnResult.constructor === AsyncGeneratorPrototype) {
      await this.setIterable(returnResult as any)

      if (this.current != null) {
        // Only assign default if generator was explicitly returned.
        this.default ??= this.current
      }

      return
    }

    if (returnResult instanceof Promise) returnResult = await returnResult

    this.default = returnResult
    await this.scheduleTransition(this.default)
  }

  private async scheduleTransition(next: unknown): Promise<void> {
    if (this.transitions == null) {
      this.set(next)
      return
    }

    let pipe = () => this.set(next)

    for (const transition of this.transitions) {
      pipe = () => transition(pipe)
    }

    pipe()
  }

  private async applyTransitions(previous: unknown, next: unknown) {
    if (this.transitionsApi.size === 0) {
      this.set(next)
      return
    }

    this.transitionsApi.markRunning(previous, next)

    const transitions = Array.from(this.transitionsApi)
    let pipeline = async () => this.set(next)

    for (let i = transitions.length - 1; i >= 0; i -= 1) {
      const nextStage = pipeline
      const transition = transitions[i]

      pipeline = async () => {
        await this.executeTransition(transition, previous, next, nextStage)
      }
    }

    try {
      await pipeline()
    } finally {
      this.transitionsApi.markFinished()
    }
  }

  private async executeTransition(
    transition: ViewTransitionEntry,
    previous: unknown,
    next: unknown,
    nextStage: () => Promise<void>
  ) {
    let advanced = false
    const transit = async () => {
      if (advanced) return
      advanced = true
      await nextStage()
    }

    try {
      const callable = transition as unknown as (this: unknown, transit: () => Promise<void>, previous: unknown, next: unknown) => unknown
      const result = callable(transit, previous, next)
      await this.awaitTransitionResult(result)
    } catch (error) {
      console.error("View transition handler failed", error)
    } finally {
      await transit()
    }
  }

  private async awaitTransitionResult(result: unknown) {
    if (result == null) return

    if (result instanceof Promise) {
      await result
      return
    }

    if (typeof result === "object") {
      const awaiting = ["finished", "ready", "updateCallbackDone", "committed", "done"]
        .map(property => (result as Record<string, unknown>)[property])
        .filter((value): value is Promise<unknown> => value instanceof Promise)

      if (awaiting.length > 0) await Promise.allSettled(awaiting)
    }
  }
}

export default ViewAPI
