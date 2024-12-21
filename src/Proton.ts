import Events from "./Events"
import { Inflator } from "./Inflator"
import Null from "./Null"
import { Subscriptable } from "./Observable"
import ProtonJSX from "./ProtonJSX"
import ProtonViewAPI from "./ProtonTreeAPI"
import TreeContextAPI from "./TreeContextAPI"

declare global {
  namespace JSX {
    interface ElementTypeConstructor {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this: never, props: any): unknown | Promise<unknown>
    }
  }
}


type ProtectedInflator = Inflator & {
  parentShell: Inflator["parentShell"]
  catchCallback: Inflator["catchCallback"]
  suspenseCallback: Inflator["suspenseCallback"]
  unsuspenseCallback: Inflator["unsuspenseCallback"]
}


interface ShellEvents {
  view: unknown
}

namespace Proton {
  export const Symbol: {
    readonly index: unique symbol
    readonly guard: unique symbol
  } = {
    index: window.Symbol.for("Proton.Index") as never,
    guard: window.Symbol.for("Proton.Guard") as never,
  }

  export interface ShellConstructor { }

  export const JSX = ProtonJSX
  export function Componentus(this: Shell) { return this }

  export class Shell {
    public readonly view: ProtonViewAPI
    public readonly inflator: Inflator
    public readonly context: TreeContextAPI

    private readonly inflatorProtected: ProtectedInflator
    private readonly events = new Events<ShellEvents>

    private lastSubject: unknown = {} // Ensures first subject to be different.
    private viewElement: unknown = null

    constructor(inflator: Inflator, parent?: Shell) {
      this.inflator = cloneInstance(inflator)
      this.inflatorProtected = this.inflator as never
      this.inflatorProtected.parentShell = this

      this.context = new TreeContextAPI(parent?.context)

      let previousView: unknown
      this.view = {
        set: subject => {
          if (subject === this.lastSubject) return
          if (subject === this.viewElement) return

          this.lastSubject = subject

          try {
            const object = this.inflator.inflate(subject)

            if (subject !== previousView) {
              previousView = this.viewElement
            }

            this.viewElement = object
            this.events.dispatch("view", object)
          } catch (thrown) {
            if (this.inflatorProtected.catchCallback != null) return void this.inflatorProtected.catchCallback(thrown)

            throw thrown
          }
        },
        reset: () => this.view.set(previousView),
        detach: () => { },
        transit: subject => document.startViewTransition(() => this.view.set(subject)),
        default: null
      }
    }

    catch<T>(catchCallback: (thrown: T) => void) { this.inflatorProtected.catchCallback = catchCallback as never }
    /**
     * Calls passed `callback` just before the component is going to be suspended.
     * Batches any down tree suspensions together while there are some unresolved.
     *
     * The `callback` can be used to set a temporary `view`.
     *
     * When the component is unsuspended, all the effects applied in the `callback` are reverted by a built-in mechanism.
     */
    suspense<T = void>(callback: (result: T) => void) { this.inflatorProtected.suspenseCallback = callback as never }
    unsuspense<T = void>(callback: (result: T) => void) { this.inflatorProtected.unsuspenseCallback = callback as never }

    getView() { return this.viewElement }
    on(event: keyof ShellEvents) { return this.events.observe(event) }
  }

  export abstract class Index {
    abstract array: unknown[]
    abstract on<K extends keyof IndexEvents>(event: K): Subscriptable<IndexEvents[K]>

    readonly [Proton.Symbol.index] = this
    readonly EMPTY = Null.OBJECT
  }

  export interface IndexEvents<T = unknown> {
    push: T[]
    null: number
    replace: T[]
  }
}

export default Proton

function cloneInstance<T>(origin: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(origin)), origin)
}
