/**
 * https://stackoverflow.com/questions/38304401/javascript-check-if-dictionary/71975382#71975382
 */
export function isRecord(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object.constructor === Object
}

export function castArray<T>(value: T | T[]): T[] {
  if (value instanceof Array === false) return [value]
  return value
}
