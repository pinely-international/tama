import Accessor from "./Accessor"
import Observable from "./Observable"

interface Act<T = never> {
  [Symbol.subscribe](next: (value: T) => void): () => void
}

namespace Act {
  export const descriptor = Symbol.for("descriptor")

  export function on(acts: Observable<unknown>[], callback: () => void) {
    const subs = acts.map(act => act[Symbol.subscribe](callback))
    return { unsubscribe: () => subs.forEach(sub => sub.unsubscribe()) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function compute<const Listenables extends Observable<any>[], U>(predicate: (...args: { [Index in keyof Listenables]: Parameters<Parameters<Listenables[Index][typeof Symbol.subscribe]>[0]>[0] }) => U, listenables: Listenables) {
    const values = Array(listenables.length).fill(null)
    const callbacks = new Set<(values: U) => void>()

    listenables.forEach((listenable, index) => {
      const accessor = Accessor.extractObservable(listenable)
      if (accessor == null) return

      if (accessor.get != null) values[index] = accessor.get()
      accessor.subscribe?.(value => {
        values[index] = accessor.get?.() ?? value
        callbacks.forEach(callback => callback(predicate(...values as never)))
      })
    })

    return {
      [Symbol.subscribe](next: (value: U) => void) {
        callbacks.add(next)
        return { unsubscribe: () => callbacks.delete(next) }
      },
      get: () => predicate(...values as never)
    }
  }
}

export default Act
