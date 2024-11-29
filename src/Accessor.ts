import Observable from "./Observable"

interface Accessor<T> {
  get(): T
  set(value: T): void
}

namespace Accessor {
  export class ProxyRecord {
    constructor(private readonly object: object) { }
  }

  export function extract<T>(object: object): Partial<Accessor<T>> { }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function extractObservable<T>(object: any): Partial<Accessor<T> & Observable<T>> | null {
    // const get = object.get instanceof Function ? () => object.get() : null
    // const set = object.set instanceof Function ? v => object.set(v) : null
    // const subscribe = object[Symbol.subscribe] instanceof Function ? next => object[Symbol.subscribe](next) : null

    if (object.subscribe == null && object[Symbol.subscribe] == null && object.get == null && object.set == null) {
      return null
    }

    if (object.subscribe == null && Symbol.subscribe != null) {
      object.subscribe = object[Symbol.subscribe]
    }

    // if (object.subscribe != null) {
    //   const subscribe = object.subscribe
    //   object.subscribe = (next: (value: unknown) => void) => subscribe.call(object, (value: unknown) => next(object.get ? object.get() : value))
    // }

    return object
  }
}

export default Accessor
