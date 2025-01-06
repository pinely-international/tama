import { Primitive } from "type-fest"

import { AccessorGet } from "@/Accessor"
import Observable from "@/Observable"
import ProtonShell from "@/Proton/ProtonShell"

import { InflatorAdapter } from "./InflatorAdapter"



abstract class Inflator {
  readonly adapters = new Set<InflatorAdapter>

  public inflate(subject: unknown): unknown {
    for (const adapter of this.adapters) {
      const result = adapter.inflate(subject)
      if (result) return result
    }

    // @ts-expect-error ok to check this way.
    if (subject instanceof Object && subject.get instanceof Function && subject[Symbol.subscribe] instanceof Function) {
      return this.inflateObservable(subject as never)
    }

    if (subject == null) return subject

    switch (typeof subject) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "symbol":
        return this.inflatePrimitive(subject)

      default:
        return this.inflatePrimitive(String(subject))
    }
  }

  protected abstract inflatePrimitive(primitive: Primitive): unknown
  protected abstract inflateFragment(): unknown
  protected abstract inflateObservable<T>(observable: Observable<T> & AccessorGet<T>): unknown

  protected abstract clone(): Inflator

  protected declare shell: ProtonShell


  static injectShell(inflator: Inflator, shell: ProtonShell): Inflator {
    const clone = inflator.clone()
    clone.shell = shell

    return clone
  }
}

export default Inflator
