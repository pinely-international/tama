import { Emitter, Signal } from "@denshya/flow"
import { Inflator } from "./Inflator"
import Null from "./Null"
import Observable, { Subscriptable } from "./Observable"
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
  catchCallback?: Inflator["catchCallback"]
  suspenseCallback?: Inflator["suspenseCallback"]
  unsuspenseCallback?: Inflator["unsuspenseCallback"]
}


interface ShellEvents {
  view: unknown
  suspend: Promise<unknown>
}

namespace Proton {
  export const Symbol: {
    readonly index: unique symbol
    readonly guard: unique symbol
  } = {
    index: globalThis.Symbol.for("Proton.Index") as never,
    guard: globalThis.Symbol.for("Proton.Guard") as never,
  }

  export function Lazy<T extends JSX.ElementTypeConstructor>(importFactory: () => Promise<{ default: T } | T>) {
    return async () => {
      const module = await importFactory()
      if ("default" in module) return ProtonJSX.Element(module.default, null, null)

      return ProtonJSX.Element(module, null, null)
    }
  }

  export class Shell {
    public readonly view: ProtonViewAPI
    public readonly inflator: Inflator
    public readonly context: TreeContextAPI

    private readonly inflatorProtected: ProtectedInflator
    private readonly events = new Emitter<ShellEvents>

    private lastSubject: unknown = {} // Ensures first subject to be different.
    private previousView: unknown = null
    private viewElement: unknown = null

    constructor(inflator: Inflator, private readonly parent?: Shell) {
      this.inflator = cloneInstance(inflator)
      this.inflatorProtected = this.inflator as never
      this.inflatorProtected.parentShell = this

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
            if (this.inflatorProtected.catchCallback != null) return void this.inflatorProtected.catchCallback(thrown)

            throw thrown
          }
        },
        reset: () => this.view.set(this.previousView),
        detach: () => { },
        transit: subject => document.startViewTransition(() => this.view.set(subject)),
        default: null
      }
    }

    catch<T>(catchCallback: (thrown: T) => void) { this.inflatorProtected.catchCallback = catchCallback as never }
    async suspendOf<T>(value: Promise<T>): Promise<T> {
      if (this.inflatorProtected.suspenseCallback == null) {
        this.parent?.events.dispatch("suspend", value)
        return await value
      }

      const suspenses = this.inflator.suspenses

      if (suspenses.length === 0) this.inflatorProtected.suspenseCallback(value)
      if (!suspenses.includes(value)) suspenses.push(value)

      const length = suspenses.length


      await Promise.all(suspenses)

      if (length === suspenses.length) {
        this.inflatorProtected.unsuspenseCallback?.(value)
        this.inflator.suspenses = []
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
    suspense<T = void>(callback: (result: T) => void) { this.inflatorProtected.suspenseCallback = callback as never }
    unsuspense<T = void>(callback: (result: T) => void) { this.inflatorProtected.unsuspenseCallback = callback as never }

    getView() { return this.viewElement }
    on<K extends keyof ShellEvents>(event: K): Subscriptable<ShellEvents[K]> { return this.events.observe(event) }

    use(subscribe: (view: unknown) => void | (() => void)) {
      this.events.observe("mount").subscribe(() => {
        const unsubscribe = subscribe(this.viewElement)
        this.events.once("unmount", unsubscribe)
      })
    }
  }

  export class Index<T> {
    private array: T[]
    private readonly events = new Emitter<ProtonIndexEvents<T>>

    constructor(init: Iterable<T> | (Observable<Iterable<T>> & AccessorGet<Iterable<T>>) | Index<T> | T) {
      if (init instanceof Index) {
        this.array = [...init.array]
        return
      }

      if (init instanceof Object && globalThis.Symbol.iterator in init) {
        this.array = [...init]
        return
      }

      if (init instanceof Object && globalThis.Symbol.subscribe in init) {
        this.array = [...init.get()]
        init[globalThis.Symbol.subscribe](next => this.replace([...next]))
        return
      }

      this.array = [init]
    }

    get length() { return this.array.length }

    private nonNullableArray() { return this.array.filter(item => item !== Null.OBJECT) }

    at(index: number): T {
      return this.array[index]
    }

    nullAt(index: number): void {
      // @ts-expect-error Null is ok.
      this.array[index] = Null.OBJECT
      this.events.dispatch("null", index)
    }

    push(...items: T[]): number {
      this.array.push(...items)
      this.events.dispatch("push", items)

      return this.array.length
    }

    map<U>(predicate: (value: T, index: number, array: T[]) => U) {
      const map = (items: T[]) => items.map((item, i) => predicate(item, i + index.array.length, items))
      const map2 = (items: T[]) => items.map((item, i) => predicate(item, i, items))

      const index = new Index(this.array.map((item, i, arr) => item !== Null.OBJECT ? predicate(item, i, arr) : item))
      this.on("push").subscribe(items => index.push(...map(items)))
      this.on("replace").subscribe(items => index.replace(map2(items)))
      this.on("null").subscribe(i => index.nullAt(i))
      return index
    }

    indexOf(item: T): number { return this.array.indexOf(item) }
    orderOf(item: T): Observable<number> {
      const next = () => this.nonNullableArray().indexOf(item)

      const indexState = new Signal(next())
      this.on("null").subscribe(() => indexState.set(next))
      this.on("replace").subscribe(() => indexState.set(next))
      return indexState
    }

    replace(items: T[]) {
      this.array.length = 0
      this.array.push(...items)
      this.events.dispatch("replace", items)
    }

    rebase() {
      this.replace(this.nonNullableArray())
    }

    on<K extends keyof ProtonIndexEvents<T>>(event: K): Subscriptable<ProtonIndexEvents<T>[K]> { return this.events.observe(event) }

    [globalThis.Symbol.subscribe](next: () => void) {
      this.on("push").subscribe(() => next())
      this.on("null").subscribe(() => next())
      this.on("replace").subscribe(() => next())
    }

    readonly [Proton.Symbol.index] = this
    readonly EMPTY = Null.OBJECT
  }
}

export default Proton

function cloneInstance<T>(origin: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(origin)), origin)
}



// abstract class ProtonIndex {
//   abstract array: unknown[]
//   abstract on<K extends keyof ProtonIndexEvents>(event: K): Subscriptable<ProtonIndexEvents[K]>

//   readonly [Proton.Symbol.index] = this
//   readonly EMPTY = Null.OBJECT
// }
interface ProtonIndexEvents<T = unknown> {
  push: T[]
  null: number
  replace: T[]
}
