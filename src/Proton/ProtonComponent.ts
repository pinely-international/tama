import { Emitter } from "@denshya/flow"

import Inflator from "@/Inflator/Inflator"

import Null from "../Null"
import { Subscriptable } from "../Observable"
import ProtonViewAPI from "../ProtonTreeAPI"
import TreeContextAPI from "../TreeContextAPI"





export class ProtonComponent {
  public readonly view: ProtonViewAPI
  public readonly inflator: Inflator
  public readonly context: TreeContextAPI

  private readonly events = new Emitter<ComponentEvents>

  private lastSubject: unknown = {} // Ensures first subject to be different.
  private previousView: unknown = null
  private viewElement: unknown = null

  /** Debug value for `constructor` which evaluated this component. */
  declare factory: Function

  constructor(inflator: Inflator, private readonly parent?: ProtonComponent) {
    this.inflator = Inflator.cloneWith(inflator, this)
    this.context = new TreeContextAPI(parent?.context)

    this.view = {
      set: subject => {
        if (subject === this.lastSubject) return
        if (subject === this.viewElement) return

        this.lastSubject = subject

        try {
          const nextView = this.inflator.inflate(subject)

          if (nextView !== this.previousView) {
            this.previousView = this.viewElement ?? nextView
          }

          this.viewElement = nextView
          this.events.dispatch("view", nextView)
        } catch (thrown) {
          if (this.catchCallback != null) return void this.catchCallback(thrown)

          throw thrown
        }
      },
      setPrevious: () => this.view.set(this.previousView),
      default: null
    }
  }

  private declare catchCallback?: (thrown: unknown) => void
  private declare suspenseCallback?: (promise: Promise<unknown>) => void
  private declare unsuspenseCallback?: (promise: Promise<unknown>) => void

  private suspenses: Promise<unknown>[] = []

  catch<T>(catchCallback: (thrown: T) => void) { this.catchCallback = catchCallback as never }
  async suspendOf<T>(value: Promise<T>): Promise<T> {
    if (this.suspenseCallback == null) {
      this.parent?.events.dispatch("suspend", value)
      return await value
    }

    const suspenses = this.suspenses

    if (suspenses.length === 0) this.suspenseCallback(value)
    if (!suspenses.includes(value)) suspenses.push(value)

    const length = suspenses.length


    await Promise.all(suspenses)

    if (length === suspenses.length) {
      this.unsuspenseCallback?.(value)
      this.suspenses = []
    }

    return await value
  }
  /**
   * Calls passed `callback` just before the component is going to be suspended.
   * Batches any down tree suspensions together while there are some unresolved.
   *
   * The `callback` can be used to set a temporary `view`.
   *
   * When the component is unsuspended, all the effects applied in the `callback` are reverted by a built-in mechanism.
   */
  suspense<T = void>(callback: (result: T) => void) { this.suspenseCallback = callback as never }
  unsuspense<T = void>(callback: (result: T) => void) { this.unsuspenseCallback = callback as never }

  getView() { return this.viewElement }
  on<K extends keyof ComponentEvents>(event: K): Subscriptable<ComponentEvents[K]> { return this.events.observe(event) }

  use(subscribe: (view: unknown) => void | (() => void)) {
    this.events.observe("mount").subscribe(() => {
      const unsubscribe = subscribe(this.viewElement) ?? Null.FUNCTION
      this.events.once("unmount", unsubscribe)
    })
  }

  /** @internal Use for debug only purposes. */
  static async evaluate(component: ProtonComponent, factory: Function, props?: Record<keyof never, unknown> | null): Promise<void> {
    component.factory = factory // For debugging.

    try {
      if (factory instanceof AsyncGeneratorFunction) {
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

const AsyncGeneratorFunction = (async function* () { }).constructor as AsyncGeneratorFunctionConstructor
