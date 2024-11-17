/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
class Observable<T> {


  // static from<T>(asd: { on(arg1: never, callback: (value: T) => unknown): unknown }): Observable<T> {}
}

namespace Observable {
  export function concat() { }
}

export default Observable


interface Observable<T> {
  subscribe: (listener: (value: T) => void) => {
    unsubscribe: () => void
  }
}

export type Unsubscribe = { unsubscribe: () => void } | (() => void) | void
