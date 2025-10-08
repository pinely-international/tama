export interface Subscriptable<T> {
  subscribe: (listener: (value: T) => void) => Unsubscribe
}

interface Observable<T> {
  subscribe(listener: (value: T) => void): Unsubscribe
}

export default Observable

export type Unsubscribe = { unsubscribe: () => void }
