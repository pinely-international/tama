export const nonGuard = (value: unknown) => value


export function iterableOf(object: object): IteratorObject<any> {
  if (Symbol.iterator in object.valueOf()) return object as never

  throw new TypeError("Given object is not iterable", { cause: { object } })
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
