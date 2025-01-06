import { AccessorGet } from "../Accessor"
import Observable from "../Observable"

class ProtonReconciler<T> {
  private transform: ((value: never, index: number, array: never[]) => T) | null = null
  private readonly source: AccessorGet<Foreachable<unknown>> & Observable<Foreachable<unknown>>

  constructor(
    source: (Foreachable<T> & Observable<Foreachable<unknown>>) | (AccessorGet<Foreachable<unknown>> & Observable<Foreachable<unknown>>),
    private readonly options?: Partial<ReconcilerOptions<unknown>>
  ) {
    if ("get" in source) {
      this.source = source
    } else {
      this.source = { get: () => source, [globalThis.Symbol.subscribe]: next => source[globalThis.Symbol.subscribe](next) }
    }
  }

  map<U>(predicate: (value: T, index: number, array: T[]) => U): ProtonReconciler<U> {
    const reconciler = new ProtonReconciler<U>(this.source, this.options)
    reconciler.transform = (value, index, array) => predicate(this.transform?.(value, index, array) ?? value, index, array)

    return reconciler
  }

  forEach(callback: (value: T, index: number) => void): void { }
  difference(): { added: number[], removed: number[], moved: number[] } {
    let added = news.filter(item => !old.includes(item));
    let removed = old.filter(item => !news.includes(item));
    // find items that only changed place
    let oldCommon = old.filter(item => news.includes(item));
    let newCommon = news.filter(item => old.includes(item));
    let moved = newCommon.filter((item, i) => item != oldCommon[i]);

    return {}
  }

  [globalThis.Symbol.subscribe](next: (value: this) => void) {
    return this.source[globalThis.Symbol.subscribe](() => next(this))
  }
}

export default ProtonReconciler


interface Foreachable<T> extends Iterable<T> {
  foreach(callback: (value: T) => void): void
}

interface ReconcilerOptions<T> {
  by(predicate: (value: T) => unknown): void
}

// interface ObservableIterator<T> extends Observable<T>, Iterable<T> { }

// function isObservableIterator(value: unknown): value is ObservableIterator<unknown> { }
