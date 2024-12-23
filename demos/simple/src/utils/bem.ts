import { Flow } from "@denshya/flow"
import { castArray, isRecord } from "./common"

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

export function bem(classNames: BEMElement | BEMElement[], ...modifiers: (Record<keyof never, boolean | undefined | null | "" | 0> | (BEMElement | BEMElement[]))[]): string {
  const mods = modifiers.flatMap(modifier => isRecord(modifier) ? Object.entries(modifier).reduce((result, [nextKey, nextValue]) => [...result, nextValue && nextKey], []) : modifier)

  return bemTil.merge(...castArray(classNames).map(className => bemTil.modify(className, ...mods)))
}


// type Statable<T> = T | Flow<T>
export const bemFlow = Flow.for(bem)
