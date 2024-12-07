import { castArray } from "lodash"

import { isRecord } from "./common"
import { Act, Events } from "@denshya/proton"

class BEM {
  /**
   *
   * @returns `class1 class2`
   */
  merge(...classNames: Array<string | null | undefined>): string {
    const space = " "
    return classNames.filter(Boolean).join(space)
  }

  /**
   * Join modifiers with origin class.
   * @returns `"origin-class origin-class--modifier"`
   */
  modify(originClass: string, ...modifiers: Array<string | number | false | null | undefined>): string {
    modifiers = modifiers.filter(Boolean)
    if (!modifiers.length) return originClass

    const space = " "
    const separator = "--"

    modifiers = modifiers.map(modifier => originClass + separator + modifier)
    return originClass + space + modifiers.join(space)
  }
}

export const bemTil = new BEM

type BEMElement = string | number | false | null | undefined

export function bem(classNames: string | string[], ...modifiers: (Record<keyof never, boolean | undefined | null | "" | 0> | BEMElement)[]): string {
  const mods = modifiers.flatMap(modifier => isRecord(modifier) ? Object.entries(modifier).reduce((result, [nextKey, nextValue]) => [...result, nextValue && nextKey], []) : modifier)

  return bemTil.merge(...castArray(classNames).map(className => bemTil.modify(className, ...mods)))
}

export function bemState(classNames: string | string[], ...modifiers: (Record<keyof never, boolean | undefined | null | "" | 0 | Events.State<unknown>> | BEMElement)[]) {
  const asd = () => Object.fromEntries(Object.entries(modifiers[0]).map(([key, value]) => ({ [key]: value instanceof Events.State ? value.get() : value })))
  const state = new Events.State(bem(classNames, asd()))


  Act.on(Object.values(modifiers[0]), () => {
    console.log(123)
    state.set(bem(classNames, asd()))
  })

  return state
}

type Statable<T> = T | Events.State<T>
const bemSs = Events.State.for(bem, (classNames: Statable<string> | Statable<string[]>, ...mods) => [classNames, ...mods])
