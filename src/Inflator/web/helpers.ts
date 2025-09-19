export const nonGuard = (value: unknown) => value


export function iterableOf(object: object) {
  if (Symbol.iterator in object) return object
  if ("get" in object && object.get instanceof Function) {
    const value = object.get()
    if (Symbol.iterator in value) return value
  }

  throw new TypeError("Unreachable code reached during extract of iterable from observable")
}



/**
 * Creates reference only when it's first accessed.
 */
export function onDemandRef<T>(factory: () => T) {
  let value: T | null = null

  return {
    get current() {
      if (value === null) value = factory()
      return value
    }
  }
}
