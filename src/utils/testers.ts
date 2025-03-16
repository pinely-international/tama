import { AccessorGet } from "@/Accessor"
import ProtonJSX from "@/jsx/ProtonJSX"
import Observable from "@/Observable"

/**
 * https://stackoverflow.com/questions/38304401/javascript-check-if-dictionary/71975382#71975382
 */
export function isRecord(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object.constructor === Object
}

export function isObservableGetter<T>(value: unknown): value is Observable<T> & AccessorGet<T> {
  // @ts-expect-error ok to check this way.
  if (value instanceof Object && value.get instanceof Function && value[Symbol.subscribe] instanceof Function) {
    return true
  }

  return false
}

export function isIterable<T>(value: unknown): value is Iterable<T> {
  // @ts-expect-error ok to check this way.
  return value instanceof Object && value[Symbol.iterator] instanceof Function
}

export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  // @ts-expect-error ok to check this way.
  return value instanceof Object && value[Symbol.asyncIterator] instanceof Function
}

export function isJSX(value: unknown): value is JSX.Element {
  if (value instanceof ProtonJSX.Node) return true

  return isRecord(value) && value.type != null
}
