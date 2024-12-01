interface Observable<T> {
  subscribe: (listener: (value: T) => void) => Unsubscribe
  [Symbol.subscribe]?: (listener: (value: T) => void) => Unsubscribe
}

export default Observable

export type Unsubscribe = { unsubscribe: () => void } | (() => void) | void
