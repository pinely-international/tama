import { AccessorSet, AccessorGet } from "./Accessor"
import Act from "./Act"
import Guarded from "./Guarded"
import Observable, { Unsubscribe } from "./Observable"

const finalization = new FinalizationRegistry<() => void>(unsubscribe => unsubscribe())

class Flow<T> {
  static of<T>(items: (T | Flow<T>)[]): Flow<T>[] {
    return items.map(Flow.from)
  }

  static from<T>(item: T | Flow<T>): Flow<T> {
    if (item instanceof Flow) return item

    return new Flow(item)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static compute<const States extends Flow<any>[], U>(states: States, predicate: (...values: { [K in keyof States]: ReturnType<States[K]["get"]> }) => U): Flow<U> {
    const values = states.map(state => state.get())

    const computed = new Flow(predicate(...values as never))

    states.forEach((state, index) => {
      state[Symbol.subscribe](value => {
        if (values[index] === value) return

        values[index] = value
        computed.set(predicate(...values as never))
      })
    })

    return computed
  }

  private readonly callbacks = new Set<(value: T) => void>()
  private value: T

  constructor(initialValue: T) {
    this.value = initialValue

    this.boundGet = (() => this.get()) as never
    this.boundGet[Symbol.subscribe] = this[Symbol.subscribe]
  }


  get(): T { return this.value }
  set(newValue: T | ((current: T) => T)): void {
    const value = newValue instanceof Function ? newValue(this.value) : newValue

    this.value = value
    this.dispatch(value)
  }


  sets<U>(other: AccessorSet<T | U>): Unsubscribe
  sets(callback: (value: T) => void): Unsubscribe
  sets<U>(arg: AccessorSet<T | U> | ((value: T) => void)): Unsubscribe {
    const set = arg instanceof Function ? arg : arg.set

    return this[Symbol.subscribe](value => set(value))
  }
  copy(other: AccessorGet<T>) { this.set(other.get()) }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly $ProxyCache: Partial<Record<keyof T, unknown>> = {}
  readonly $ = new Proxy(this, {
    get: (target, key) => {
      const cached = this.$ProxyCache[key as keyof T]
      if (cached != null) return cached

      const targetValueItem = target.value[key as keyof T]
      if (targetValueItem instanceof Function) {
        const method = (...args: unknown[]) => {
          const result = targetValueItem.apply(target.value, args)
          // Method resulting with itself usually means it was updated.
          if (result === target.value) {
            target.dispatch(target.value)
            return target
          }

          const predicate = (value: T) => targetValueItem.apply(value, args)
          const fork = new Flow(result)
          // Follows `this.to` method implementation from here.
          this[Symbol.subscribe](value => {
            const newValue = predicate(value)
            newValue !== fork.value && fork.set(newValue)
          })
          return fork
        }
        this.$ProxyCache[key as keyof T] = method

        return method
      }

      const property = target.to(value => value[key as keyof T])
      this.$ProxyCache[key as keyof T] = property

      return property
    }
  }) as unknown as { [K in keyof T]-?: T[K] extends (...args: infer Args) => infer Return ? (...args: Args) => Flow<Return> : Flow<T[K]> }

  get it() { return this.value }
  set it(value: T) { this.set(value) }

  to<U>(predicate: (value: T) => U): Flow<U> {
    const fork = new Flow(predicate(this.value))
    this[Symbol.subscribe](value => {
      const newValue = predicate(value)
      newValue !== fork.value && fork.set(newValue)
    })
    return fork
  }

  from(predicate: (value: T) => T): Flow<T> {
    const fork = new Flow(this.value)
    const set = fork.set
    fork.set = value => set.call(fork, value instanceof Function ? predicate(value(fork.value)) : predicate(value))
    this.sets(fork)
    return fork
  }

  fork() { new Flow(this.get()) }
  clone() {
    const cloned = new Flow(this.get())
    this.sets(cloned)
    return cloned
  }

  readonly(): StateReadonly<T> {
    return { get: () => this.get(), [Symbol.subscribe]: next => this[Symbol.subscribe](next) }
  }

  writeonly(): StateWriteonly<T> {
    return { set: v => this.set(v) }
  }

  is(predicate: (value: T) => boolean): StateReadonly<boolean>
  is<U extends T>(predicate: (value: T) => value is U): StateReadonly<boolean> {
    return { get: () => predicate(this.get()), [Symbol.subscribe]: next => this[Symbol.subscribe](value => next(predicate(value))) }
  }
  readonly isNullish: StateReadonly<boolean> = this.is(value => value == null)
  readonly isNotNullish: StateReadonly<boolean> = this.is(value => value != null)

  guard<U extends T>(predicate: (value: T) => boolean): Guarded<U, T> & StateReadonly<T>
  guard<U extends T>(predicate: (value: T) => value is U): Guarded<U, T> & StateReadonly<T> {
    const guardedState = this.readonly() as Guarded<U, T> & StateReadonly<T>
    guardedState.valid = predicate

    return guardedState
  }
  readonly nullable: Guarded<T | null | undefined, T | null | undefined> & StateReadonly<T> = this.guard(value => value == null)
  readonly nonNullable: Guarded<T & {}, T> & StateReadonly<T & {}> = this.guard(value => value != null) as never
  readonly required: Guarded<T & {}, T> & StateReadonly<T & {}> = this.nonNullable


  private boundGet: ((() => T) & Observable<T>)
  private boundSet = (newValue: T | ((current: T) => T)) => this.set(newValue)


  private dispatch(value: T) {
    this.callbacks.forEach(callback => callback(value))
  }

  [Symbol.reveal]() { return this.value }
  [Act.descriptor](): PropertyDescriptor {
    return { get: this.boundGet, set: this.boundSet }
  }

  *[Symbol.iterator]() {
    yield this.boundGet
    yield this.boundSet
  }
  [Symbol.subscribe](next: (value: T) => void) {
    this.callbacks.add(next)

    const unsubscribe = () => void this.callbacks.delete(next)
    finalization.register(this, unsubscribe)

    return { unsubscribe }
  }
}


type FlowReadonly<T> = Observable<T> & AccessorGet<T>
type FlowWriteonly<T> = { set(value: T | ((value: T) => T)): void }
