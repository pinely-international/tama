import { Emitter, Signal } from "@denshya/flow"
import { Inflator } from "./Inflator"
import Null from "./Null"
import Observable, { Subscriptable } from "./Observable"
import ProtonJSX from "./ProtonJSX"
import ProtonViewAPI from "./ProtonTreeAPI"
import TreeContextAPI from "./TreeContextAPI"
import { AccessorGet } from "./Accessor"

declare global {
  namespace JSX {
    interface ElementTypeConstructor {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this: never, props: any): unknown | Promise<unknown>
    }
  }
}

interface ShellEvents {
  view: unknown
  suspend: Promise<unknown>

  mount: unknown
  unmount: void
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

    private readonly events = new Emitter<ShellEvents>

    private lastSubject: unknown = {} // Ensures first subject to be different.
    private previousView: unknown = null
    private viewElement: unknown = null

    constructor(inflator: Inflator, private readonly parent?: Shell) {
      this.inflator = Inflator.clone(inflator, this)
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
        reset: () => this.view.set(this.previousView),
        detach: () => { },
        transit: subject => document.startViewTransition(() => this.view.set(subject)),
        default: null
      }
    }

    protected declare catchCallback?: (thrown: unknown) => void
    protected declare suspenseCallback?: (promise: Promise<unknown>) => void
    protected declare unsuspenseCallback?: (promise: Promise<unknown>) => void

    private suspenses: Promise<unknown>[] = []

    protected async evaluate(constructor: Function, props?: {}): Promise<void> {
      constructor = await resolveShellConstructorModule(constructor)

      try {
        this.view.default = await Promise.resolve(constructor.call(this, props))
      } catch (thrown) {
        if (this.suspenseCallback != null && thrown instanceof Promise) {
          if (this.suspenses.length === 0) this.suspenseCallback(thrown)
          if (!this.suspenses.includes(thrown)) this.suspenses.push(thrown)

          const length = this.suspenses.length


          await Promise.all(this.suspenses)
          this.view.default = await constructor.call(this, props)


          if (length === this.suspenses.length) {
            this.unsuspenseCallback?.(thrown)
            this.suspenses = []
          }

          return
        }
        if (this.catchCallback != null) return void this.catchCallback(thrown)

        throw thrown
      }

      this.view.set(this.view.default)

      requestAnimationFrame(() => { // Scheduling should not be here.
        this.events.dispatch("mount", this.getView())
      })
    }

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
  }

  export class Index<T> {
    private array: T[]
    private readonly events = new Emitter<ProtonIndexEvents<T>>

    constructor(init: Iterable<T> | (Iterable<T> & Observable<Iterable<T>>) | (Observable<Iterable<T>> & AccessorGet<Iterable<T>>) | Index<T> | T) {
      if (init instanceof Index) {
        this.array = [...init.array]
        return
      }

      if (init instanceof Object && globalThis.Symbol.subscribe in init && globalThis.Symbol.iterator in init) {
        this.array = [...init]
        init[globalThis.Symbol.subscribe](next => this.replace([...next]))
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
    orderOf(index: number): Observable<number> & AccessorGet<number> {
      const next = () => {
        let order = -1

        for (let itemIndex = 0; itemIndex <= index; itemIndex++) {
          const item = this.array[itemIndex]
          if (item !== Null.OBJECT) order += 1
        }

        if (order === -1) {
          throw new ReferenceError()
        }
        return order
      }

      const indexState = new Signal(next())
      this.on("null").subscribe(() => indexState.set(next()))
      this.on("replace").subscribe(() => indexState.set(next()))
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


interface ProtonIndexEvents<T = unknown> {
  push: T[]
  null: number
  replace: T[]
}


// export type ProtonShellConstructor = (this: Proton.Shell, props?: {}) => unknown


interface Module<T> {
  default: T
}

async function resolveShellConstructorModule(moduleOrConstructor: Promise<Module<Function>> | Module<Function> | Function): Promise<Function> {
  if (moduleOrConstructor instanceof Function) return moduleOrConstructor
  if (moduleOrConstructor instanceof Promise) return (await moduleOrConstructor).default

  return moduleOrConstructor.default
}
