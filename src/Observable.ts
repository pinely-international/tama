export interface Subscribe<T> {
  (listener: (value: T) => void): Unsubscribe
}

export interface Subscriptable<T> {
  subscribe: (listener: (value: T) => void) => Unsubscribe
}

interface Observable<T> {
  [Symbol.subscribe](listener: (value: T) => void): Unsubscribe
}


// namespace Observable {
//   export function all<T extends Observable<unknown>[]>(values: T): Observable<T> { }
// }

export default Observable

export type Unsubscribe = { unsubscribe: () => void }
