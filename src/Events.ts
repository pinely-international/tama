import Act from "./Act"
import Null from "./Null"
import Observable from "./Observable"

// @ts-expect-error it's ok.
Symbol.subscribe = Symbol.for("subscribe")

// type EventActionFrom<EventMap extends Record<keyof never, unknown>> = { [Type in keyof EventMap]: { type: EventMap, payload: EventMap[Type] } }

const finalization = new FinalizationRegistry<() => void>(unsubscribe => unsubscribe())

class Events<EventMap extends Record<EventName, unknown>, EventName extends keyof EventMap = keyof EventMap> {
  constructor() {
    const temp = { callbacks: this.callbacks }
    finalization.register(this, () => temp.callbacks = {})
  }
  // public static Map = class Map


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Partial<Record<keyof never, Set<(value: any) => void>>> = {}

  private on<Event extends keyof EventMap>(event: Event, callback: (value: EventMap[Event]) => void) {
    this.callbacks[event] ??= new Set
    this.callbacks[event]?.add(callback)
  }
  private off<Event extends keyof EventMap>(event: Event, callback: (value: EventMap[Event]) => void) {
    this.callbacks[event]?.delete(callback)
  }

  public once<Event extends keyof EventMap>(event: Event, callback: (value: EventMap[Event]) => void): void {
    const once: typeof callback = value => {
      callback(value)
      this.off(event, once)
    }

    this.on(event, once)
  }
  public until<Event extends keyof EventMap>(event: Event, timeout = 15 * 1000): Promise<EventMap[Event]> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(`Time's out awaiting event "${event.toString()}"`)), timeout)

      this.once(event, value => {
        resolve(value)
        clearTimeout(timeoutId)
      })
    })
  }

  public dispatch<Event extends keyof EventMap>(event: Event, payload: EventMap[Event]) {
    this.callbacks[event]?.forEach(callback => callback(payload))
  }
  public observe<Event extends keyof EventMap>(event: Event): Observable<EventMap[Event]> {
    return {
      subscribe: (next?: (value: EventMap[Event]) => void) => {
        const callback = (value: EventMap[Event]) => next?.(value)
        this.on(event, callback)

        return { unsubscribe: () => this.off(event, callback) }
      }
    }
  }

  // public toReadonly(): Observable<EventActionFrom<T>> {}
}

namespace Events {
  export class Messager<T> {
    readonly callbacks = new Set<(value: T) => void>()

    dispatch(value: T) {
      this.callbacks.forEach(callback => callback(value))
    }

    subscribe(callback: (value: T) => void) {
      this.callbacks.add(callback)
      return { unsubscribe: () => void this.callbacks.delete(callback) }
    }
  }

  /**
   * Shorthand for `Events.Messager<void>`. You can use it for better semantics.
   */
  export class Notifier extends Events.Messager<void> { }
  export class State<T> {
    static of<T>(items: (T | State<T>)[]): State<T>[] {
      return items.map(State.from)
    }

    static from<T>(item: T | State<T>): State<T> {
      if (item instanceof State) return item

      return new State(item)
    }

    private readonly callbacks = new Set<(value: T) => void>()
    private value: T

    constructor(initialValue: T) {
      this.value = initialValue
      this.boundGet[Symbol.subscribe] = this[Symbol.subscribe]
    }

    get(): T { return this.value }
    set(newValue: T | ((current: T) => T)): void {
      const value = newValue instanceof Function ? newValue(this.value) : newValue

      this.value = value
      this.dispatch(value)
    }

    map<U>(predicate: (value: T) => U): State<U> {
      const newState = new State(predicate(this.value))

      this[Symbol.subscribe](value => newState.set(predicate(value)))

      return newState
    }

    readonly(): StateReadonly<T> {
      return Act.compute(value => value, [this])
    }

    writeonly(): StateWriteonly<T> {
      return { set: v => this.set(v) }
    }

    private boundGet: ((() => T) & Observable<T>) = () => this.get()
    private boundSet = (newValue: T | ((current: T) => T)) => this.set(newValue)

    private dispatch(value: T) {
      this.callbacks.forEach(callback => callback(value))
    }

    [Symbol.reveal]() { return this.value }
    [Act.descriptor](): PropertyDescriptor {
      return { get: this.boundGet, set: this.boundSet }
    }

    public readonly _Tuple!: readonly [typeof this.boundGet, typeof this.boundSet]

    *[Symbol.iterator]() {
      yield this.boundGet
      yield this.boundSet
    }
    [Symbol.subscribe] = (next: (value: T) => void) => {
      this.callbacks.add(next)

      const unsubscribe = () => void this.callbacks.delete(next)
      finalization.register(this, unsubscribe)

      return { unsubscribe }
    }
  }

  export class Index<T> {
    private array: T[]
    private readonly events = new Events

    constructor(init: Iterable<T>) { this.array = [...init] }

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
      const map = (items: never[]) => items.map((item, i) => predicate(item, i + index.array.length, items))
      const map2 = (items: never[]) => items.map((item, i) => predicate(item, i, items))

      const index = new Index(this.array.map((item, i, arr) => item !== Null.OBJECT ? predicate(item, i, arr) : item))
      this.on("push").subscribe?.(items => index.push(...map(items)))
      this.on("replace").subscribe?.(items => index.replace(map2(items)))
      this.on("null").subscribe?.(i => index.nullAt(i))
      return index
    }

    indexOf(item: T): number { return this.array.indexOf(item) }
    orderOf(item: T): Observable<number> {
      const next = () => this.nonNullableArray().indexOf(item)

      const indexState = new State(next())
      this.on("null").subscribe?.(() => indexState.set(next))
      this.on("replace").subscribe?.(() => indexState.set(next))
      return indexState.readonly()
    }

    replace(items: T[]) {
      this.array.length = 0
      this.array.push(...items)
      this.events.dispatch("replace", items)
    }

    rebase() {
      this.replace(this.nonNullableArray())
    }

    on(event: string) {
      const asd = this.events.observe(event)
      return {
        subscribe: next => {
          const sub = asd.subscribe!(next)
          finalization.register(this.array, sub.unsubscribe)
          return sub
        }
      }
    }
  }

  export class StateIndex<T> extends Index<State<T>> {
    constructor(init: Iterable<T> | Observable<Iterable<T>> | State<Iterable<T>>) {
      if (init instanceof State) {
        super(State.of([...init.get()]))

        init[Symbol.subscribe](items => this.replace(items))
      } else if (Symbol.iterator in init === false) {
        super(Null.ARRAY)

        init[Symbol.subscribe](items => this.replace(items))
      } else {
        super(State.of([...init]))
      }
    }

    override push(item: T | State<T>) { return super.push(State.from(item)) }
    override replace(items: (T | State<T>)[]) { return super.replace(State.of(items)) }
  }
}

export default Events

// export function signal(): PropertyDecorator | ParameterDecorator { return (target: Object, propertyKey: string | symbol) => { } }


type StateReadonly<T> = Observable<T> & { get(): T }
type StateWriteonly<T> = { set(value: T | ((value: T) => T)): void }
