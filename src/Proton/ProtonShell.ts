import { Emitter } from "@denshya/flow"

import Inflator from "@/Inflator/Inflator"

import Null from "../Null"
import { Subscriptable } from "../Observable"
import ProtonViewAPI from "../ProtonTreeAPI"
import TreeContextAPI from "../TreeContextAPI"





export class ProtonShell {
  public readonly view: ProtonViewAPI
  public readonly inflator: Inflator
  public readonly context: TreeContextAPI

  private readonly events = new Emitter<ShellEvents>

  private lastSubject: unknown = {} // Ensures first subject to be different.
  private previousView: unknown = null
  private viewElement: unknown = null

  /** Debug value for `constructor` which evaluated this shell. */
  declare private evaluatedBy: Function

  constructor(inflator: Inflator, private readonly parent?: ProtonShell) {
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
  on<K extends keyof ShellEvents>(event: K): Subscriptable<ShellEvents[K]> { return this.events.observe(event) }

  use(subscribe: (view: unknown) => void | (() => void)) {
    this.events.observe("mount").subscribe(() => {
      const unsubscribe = subscribe(this.viewElement) ?? Null.FUNCTION
      this.events.once("unmount", unsubscribe)
    })
  }

  static async evaluate(shell: ProtonShell, constructor: Function, props?: Record<keyof never, unknown> | null): Promise<void> {
    shell.evaluatedBy = constructor // Pure. For debugging.
    constructor = await resolveShellConstructorModule(constructor)

    try {
      shell.view.default = await Promise.resolve(constructor.call(shell, props))
    } catch (thrown) {
      if (shell.suspenseCallback != null && thrown instanceof Promise) {
        if (shell.suspenses.length === 0) shell.suspenseCallback(thrown)
        if (!shell.suspenses.includes(thrown)) shell.suspenses.push(thrown)

        const length = shell.suspenses.length


        await Promise.all(shell.suspenses)
        shell.view.default = await constructor.call(shell, props)


        if (length === shell.suspenses.length) {
          shell.unsuspenseCallback?.(thrown)
          shell.suspenses = []
        }

        return
      }
      if (shell.catchCallback != null) return void shell.catchCallback(thrown)

      throw thrown
    }

    shell.view.set(shell.view.default)
  }
}

interface ShellEvents {
  view: unknown
  suspend: Promise<unknown>

  mount: unknown
  unmount: void
}

interface Module<T> {
  default: T
}


async function resolveShellConstructorModule(moduleOrConstructor: Promise<Module<Function>> | Module<Function> | Function): Promise<Function> {
  if (moduleOrConstructor instanceof Function) return moduleOrConstructor
  if (moduleOrConstructor instanceof Promise) return (await moduleOrConstructor).default

  return moduleOrConstructor.default
}
