import { Emitter } from "@denshya/reactive"

import { AsyncGeneratorFunction } from "@/BuiltinObjects"
import Inflator from "@/Inflator/Inflator"

import ProtonViewAPI from "../ProtonTreeAPI"
import TreeContextAPI from "../TreeContextAPI"





export class ProtonComponent {
  public readonly view: ProtonViewAPI
  public readonly inflator: Inflator
  public readonly context: TreeContextAPI

  /** @internal */
  readonly events = new Emitter<ComponentEvents>

  /** @internal Debug value for `constructor` which evaluated this component. */
  factory?: Function

  constructor(inflator: Inflator, private readonly parent?: ProtonComponent) {
    this.inflator = Inflator.cloneWith(inflator, this)
    this.context = new TreeContextAPI(parent?.context)

    let lastSubject: unknown = {} // Ensures first subject to be different.
    let previousView: unknown = null
    let current: unknown = null

    this.view = {
      set: subject => {
        if (subject === lastSubject) return
        if (subject === current) return

        lastSubject = subject

        try {
          const nextView = this.inflator.inflate(subject)

          if (nextView !== previousView) {
            previousView = current ?? nextView
          }

          current = nextView
          this.events.dispatch("view", nextView)
        } catch (thrown) {
          if (this.catchCallback != null) return void this.catchCallback(thrown)

          throw thrown
        }
      },
      setPrevious: () => this.view.set(previousView),
      default: null,
      current
    }
  }

  private declare catchCallback?: (thrown: unknown) => void
  private declare suspenseCallback?: (promise: Promise<unknown>) => void
  private declare unsuspenseCallback?: (promise: Promise<unknown>) => void

  private suspenses: Promise<unknown>[] = []

  /** @internal */
  static async evaluate(component: ProtonComponent, factory: Function, props?: Record<keyof never, unknown> | null): Promise<void> {
    component.factory = factory // For debugging.

    try {
      if (factory instanceof AsyncGeneratorFunction.constructor) {
        const factoryAsyncGenerator = factory.call(component, props)

        let yieldResult: IteratorResult<unknown> = { done: false, value: undefined }
        while (yieldResult.done === false) {
          yieldResult = await factoryAsyncGenerator.next()
          component.view.set(yieldResult.value)
        }

        if (component.viewElement != null) {
          // Only assign default if generator was explicitly returned.
          component.view.default = component.viewElement
        }
        return
      }

      let returnResult = factory.call(component, props)
      if (returnResult instanceof Promise) returnResult = await returnResult
      if (returnResult == null) return

      component.view.default = component.inflator.inflate(returnResult)
      component.view.set(component.view.default)
    } catch (thrown) {
      if (component.suspenseCallback != null && thrown instanceof Promise) {
        if (component.suspenses.length === 0) component.suspenseCallback(thrown)
        if (!component.suspenses.includes(thrown)) component.suspenses.push(thrown)

        const length = component.suspenses.length


        await Promise.all(component.suspenses)
        component.view.default = component.inflator.inflate(await factory.call(component, props))


        if (length === component.suspenses.length) {
          component.unsuspenseCallback?.(thrown)
          component.suspenses = []
        }

        return
      }
      if (component.catchCallback != null) return void component.catchCallback(thrown)

      throw thrown
    }
  }
}

export type ProtonComponentPublic = InstanceType<typeof ProtonComponent>

interface ComponentEvents {
  view: unknown
  suspend: Promise<unknown>

  mount: unknown
  unmount: void
}
