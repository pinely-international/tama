interface Act<T = never> {
  [Symbol.subscribe](next: (value: T) => void): () => void
}

namespace Act {
  export function on(callback: () => void, acts: Act[]) {
    const subs = acts.map(act => act[Symbol.subscribe](callback))

    return () => subs.forEach(sub => sub())
  }
}

export default Act
