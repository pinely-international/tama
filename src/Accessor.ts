import { Subscriptable } from "./Observable"

interface Accessor<T> {
  get(): T
  set(value: T): void
}

export interface AccessorReadonly<T> { get(): T }
export interface AccessorWriteonly<T> { set(value: T): void }

export type Accessible<T> = Partial<Accessor<T>>

namespace Accessor {
  // export class ProxyRecord {
  //   constructor(private readonly object: object) { }
  // }

  // export function extract<T>(object: object): Partial<Accessor<T>> { }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function extractObservable<T>(object: any): Partial<Accessor<T> & Subscriptable<T>> | null {
    if (object.subscribe == null && object[Symbol.subscribe] == null && object.get == null && object.set == null) {
      return null
    }

    if (object.subscribe == null && Symbol.subscribe != null) {
      object.subscribe = object[Symbol.subscribe]
    }

    return object
  }
}

export default Accessor
