import Observable from "./Observable"

interface Act<T = never> {
  [Symbol.subscribe](next: (value: T) => void): () => void
}

namespace Act {
  export const descriptor = Symbol.for("descriptor")

  export function on(acts: Observable<unknown>[], callback: () => void) {
    const subs = acts.map(act => act[Symbol.subscribe](callback))

    return () => subs.forEach(sub => sub())
  }

  export function compute<const Listenables extends Observable<unknown>[], R>(callback: (...args: { [Index in keyof Listenables]: Parameters<Parameters<Listenables[Index][typeof Symbol.subscribe]>[0]>[0] }) => R, listenables: Listenables) {
    const l = listenables[0]

    return {
      [Symbol.subscribe](next: (value: R) => void) {
        // listenables.map(listenable => listenable[Symbol.subscribe])
        return l[Symbol.subscribe](value => next(callback(value)))
      },
      get() {
        return callback(...listenables.map(l => l.get?.()))
      }
    }
  }

  export function string(...args: unknown[]) {
    const l = listenables[0]

    return {
      [Symbol.subscribe](next: (value: R) => void) {
        // listenables.map(listenable => listenable[Symbol.subscribe])
        return l[Symbol.subscribe](value => next(callback(value)))
      }
    }
  }

  // export const Deps = eval("() => eval(DETECT_DEPS)")
  // eval.arguments

  export function mux<T>(initialValue: T, clause: () => void, deps): Observable<T> {
    return deps(clause)

    // return {
    //   [Symbol.subscribe](next: T) {
    //     return act[Symbol.subscribe](value => next(callback(value)))
    //   }
    // }
  }

  export function define<T extends object>(object: T, record: Partial<Record<keyof T, { [descriptor](): PropertyDescriptor }>>): void {
    for (const key in record) {
      Object.defineProperty(object, key, record[key][descriptor]())
    }
  }
}

// const DETECT_DEPS = `(clause) => {
//   const asd = clause.toString().match(/([a-zA-Z]+)(?=\\.)/g).toString()
//   return eval("[" + asd + "]")
// }`

export default Act
