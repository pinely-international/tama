export interface Subscriptable<T> {
  subscribe: (listener: (value: T) => void) => Subscription
}

interface Observable<T> {
  subscribe(listener: (value: T) => void): Subscription
}

export default Observable

export type Subscription = { unsubscribe: () => void }
