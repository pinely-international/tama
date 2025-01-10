import { Primitive } from "type-fest"

import { AccessorGet } from "@/Accessor"
import Observable from "@/Observable"
import { ProtonShell } from "@/Proton/ProtonShell"
import { isObservableGetter } from "@/utils/observable"

import InflatorAdaptersMap from "./InflatorAdaptersMap"


abstract class Inflator {
  adapters = new InflatorAdaptersMap(this)

  public inflate(subject: unknown): unknown {
    for (const adapter of this.adapters.values()) {
      adapter.inflator = this
      const result = adapter.inflate(subject)
      if (result) return result
    }

    if (isObservableGetter(subject)) {
      return this.inflateObservable(subject)
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

  protected declare shell?: ProtonShell


  static cloneWith(inflator: Inflator, shell: ProtonShell): Inflator {
    const clone = inflator.clone()

    clone.shell = shell
    clone.adapters = new InflatorAdaptersMap(clone, inflator.adapters)

    return clone
  }
}

export default Inflator
