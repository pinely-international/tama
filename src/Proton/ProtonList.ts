import { Emitter, Signal } from "@denshya/flow"

import { InflatorAdapter } from "@/Inflator/InflatorAdapter"
import { disconnectInflated, isNode } from "@/Inflator/web/helpers"

import { AccessorGet } from "../Accessor"
import Null from "../Null"
import Observable, { Subscriptable } from "../Observable"



interface ProtonIndexEvents<T = unknown> {
  push: T[]
  null: number
  replace: T[]
}


class ProtonList<T> {
  private array: T[]
  private readonly events = new Emitter<ProtonIndexEvents<T>>

  constructor(init: Iterable<T> | (Iterable<T> & Observable<Iterable<T>>) | (Observable<Iterable<T>> & AccessorGet<Iterable<T>>) | ProtonList<T> | T) {
    if (init instanceof ProtonList) {
      this.array = [...init.array]
      return
    }

    if (init instanceof Object && Symbol.subscribe in init && Symbol.iterator in init) {
      this.array = [...init]
      init[Symbol.subscribe](next => this.set([...next]))
      return
    }

    if (init instanceof Object && Symbol.iterator in init) {
      this.array = [...init]
      return
    }

    if (init instanceof Object && Symbol.subscribe in init) {
      this.array = [...init.get()]
      init[globalThis.Symbol.subscribe](next => this.set([...next]))
      return
    }

    this.array = [init]
  }

  get length() { return this.array.length }

  private nonNullableArray() { return this.array.filter(item => item !== Null.OBJECT) }

  at(index: number): T {
    return this.array[index]
  }

  nullAt(index: number): void {
    // @ts-expect-error Null is ok.
    this.array[index] = Null.OBJECT
    this.events.dispatch("null", index)
  }

  push(...items: T[]): number {
    this.array.push(...items)
    this.events.dispatch("push", items)

    return this.array.length
  }

  map<U>(predicate: (value: T, index: number, array: T[]) => U) {
    const map = (items: T[]) => items.map((item, i) => predicate(item, i + index.array.length, items))
    const map2 = (items: T[]) => items.map((item, i) => predicate(item, i, items))

    const index = new ProtonList(this.array.map((item, i, arr) => item !== Null.OBJECT ? predicate(item, i, arr) : item))
    this.on("push").subscribe(items => index.push(...map(items)))
    this.on("replace").subscribe(items => index.set(map2(items)))
    this.on("null").subscribe(i => index.nullAt(i))
    return index
  }

  indexOf(item: T): number { return this.array.indexOf(item) }
  orderOf(index: number): Observable<number> & AccessorGet<number> {
    const next = () => {
      let order = -1

      for (let itemIndex = 0; itemIndex <= index; itemIndex++) {
        const item = this.array[itemIndex]
        if (item !== Null.OBJECT) order += 1
      }

      if (order === -1) {
        throw new ReferenceError()
      }
      return order
    }

    const indexState = new Signal(next())
    this.on("null").subscribe(() => indexState.set(next()))
    this.on("replace").subscribe(() => indexState.set(next()))
    return indexState
  }

  set(items: T[]) {
    this.array.length = 0
    this.array.push(...items)
    this.events.dispatch("replace", items)
  }

  rebase() {
    this.set(this.nonNullableArray())
  }

  on<K extends keyof ProtonIndexEvents<T>>(event: K): Subscriptable<ProtonIndexEvents<T>[K]> { return this.events.observe(event) }

  [Symbol.subscribe](next: () => void) {
    this.on("push").subscribe(() => next())
    this.on("null").subscribe(() => next())
    this.on("replace").subscribe(() => next())
  }

  readonly EMPTY = Null.OBJECT
}

export default ProtonList


export class ProtonListWebInflator extends InflatorAdapter {
  private readonly tempFragment = new DocumentFragment
  inflate(list: unknown) {
    if (list instanceof ProtonList === false) return null

    const comment = new Comment(list.constructor.name)

    const inflateItem = (item: unknown) => item !== list.EMPTY ? this.inflate(item) : item
    // @ts-expect-error by design.
    const items = list.array
    let inflatedIndexedItems: unknown[] = items.map(inflateItem)

    this.tempFragment.replaceChildren(...inflatedIndexedItems.filter(isNode))
    this.tempFragment.append(comment)

    list.on("push").subscribe(newItems => {
      const newInflatedItems = newItems.map(inflateItem)
      inflatedIndexedItems.push(...newInflatedItems)

      this.tempFragment.replaceChildren(...newInflatedItems.filter(isNode))
      comment.before(this.tempFragment)
    })
    list.on("null").subscribe(i => {
      const item = inflatedIndexedItems[i]
      inflatedIndexedItems[i] = list.EMPTY

      disconnectInflated(item)
    })
    list.on("replace").subscribe(newItems => {
      inflatedIndexedItems.forEach(disconnectInflated)

      const newInflatedItems = newItems.map(inflateItem)
      inflatedIndexedItems = newInflatedItems

      this.tempFragment.replaceChildren(...newInflatedItems.filter(isNode))
      comment.before(this.tempFragment)
    })

    return this.tempFragment
  }
}
