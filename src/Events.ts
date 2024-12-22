import Null from "./Null"
import Observable, { Subscriptable, Unsubscribe } from "./Observable"
import Proton from "./Proton"



class Events<EventMap extends Record<EventName, unknown>, EventName extends keyof EventMap = keyof EventMap> {
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
  public observe<Event extends keyof EventMap>(event: Event): Subscriptable<EventMap[Event]> {
    return {
      subscribe: (next?: (value: EventMap[Event]) => void) => {
        const callback = (value: EventMap[Event]) => next?.(value)
        this.on(event, callback)

        return { unsubscribe: () => this.off(event, callback) }
      }
    }
  }
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

  export class Index<T> {
    private array: T[]
    private readonly events = new Events<Proton.IndexEvents<T>>

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

      const indexState = new Flow(next())
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

    on<K extends keyof Proton.IndexEvents>(event: K) { return this.events.observe(event) }

    [Symbol.subscribe](next: () => void) {
      this.on("push").subscribe(() => next())
      this.on("null").subscribe(() => next())
      this.on("replace").subscribe(() => next())
    }

    readonly [Proton.Symbol.index] = this
    readonly EMPTY = Null.OBJECT
  }

  export class StateIndex<T> extends Index<Flow<T>> {
    constructor(init: Iterable<T> | Observable<Iterable<T>> | Flow<Iterable<T>>) {
      if (init instanceof Flow) {
        super(Flow.of([...init.get()]))

        init[Symbol.subscribe](items => this.replace([...items]))
      } else if (Symbol.iterator in init === false) {
        super(Null.ARRAY)

        init[Symbol.subscribe](items => this.replace([...items]))
      } else {
        super(Flow.of([...init]))
      }
    }

    override push(item: T | Flow<T>) { return super.push(Flow.from(item)) }
    override replace(items: (T | Flow<T>)[]) { return super.replace(Flow.of(items)) }
  }
}

export default Events
