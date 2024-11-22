import Act from "./Act"
import Observable from "./Observable"

// @ts-expect-error it's ok.
Symbol.subscribe = Symbol.for("subscribe")

// type EventActionFrom<EventMap extends Record<keyof never, unknown>> = { [Type in keyof EventMap]: { type: EventMap, payload: EventMap[Type] } }

class Events<EventMap extends Record<EventName, unknown>, EventName extends keyof EventMap = keyof EventMap> {


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
      return { unsubscribe: () => void this.callbacks.delete(next) }
    }
  }

  // export function batch(clause: () => void) { }
  // export function unbatch(clause: () => void) { }
}

export default Events

// export function signal(): PropertyDecorator | ParameterDecorator { return (target: Object, propertyKey: string | symbol) => { } }
