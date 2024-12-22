import { castArray, isRecord } from "./common"
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

export function bem(classNames: string | string[], ...modifiers: (Record<keyof never, boolean | undefined | null | "" | 0> | (BEMElement | BEMElement[]))[]): string {
  const mods = modifiers.flatMap(modifier => isRecord(modifier) ? Object.entries(modifier).reduce((result, [nextKey, nextValue]) => [...result, nextValue && nextKey], []) : modifier)

  return bemTil.merge(...castArray(classNames).map(className => bemTil.modify(className, ...mods)))
}


// type Statable<T> = T | Events.State<T>
// const bemSs = Events.State.for(bem, (classNames: Statable<string> | Statable<string[]>, ...mods) => [classNames, ...mods])
