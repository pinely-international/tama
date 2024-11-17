interface Act<T = never> {
  [Symbol.subscribe](next: (value: T) => void): () => void
}

namespace Act {
  export function on(callback: () => void, acts: Act[]) {
    const subs = acts.map(act => act[Symbol.subscribe](callback))

    return () => subs.forEach(sub => sub())
  }

  export function compute<A extends Act>(callback: () => void, act: A) {
    return {
      [Symbol.subscribe](next) {
        return act[Symbol.subscribe](value => next(callback(value)))
      }
    }
  }
}

export default Act
