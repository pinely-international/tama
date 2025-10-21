import { State } from "@denshya/reactive"

import Guarded from "./Guarded"
import Observable from "./Observable"

namespace Mount {
  const nullable = (value: unknown) => !value
  const nonNullable = (value: unknown) => value
  const patch = (value: any, valid: any) => {
    if (typeof value === "object" && value !== null) {
      if ("valid" in value) {
        value = State.from(value)
      }
      value.valid = valid
    }

    return value
  }

  export const If = <T>(value: Observable<T>, predicate?: <U extends T>(value: T) => value is U): Guarded<NonNullable<T>, T> & Observable<NonNullable<T>> => patch(value, predicate ?? nonNullable)
  export const Unless = <T>(value: Observable<T>): Guarded<T | null | undefined, T | null | undefined> & Observable<T | null | undefined> => patch(value, nullable)
}

export default Mount
