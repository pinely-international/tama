import { State, StateOrPlain } from "@denshya/reactive"

import { castArray, isRecord } from "./common"

class BEM {
  /**
   *
   * @returns `class1 class2`
   */
  merge(...classNames: Array<BEMElement>): string {
    const space = " "
    return classNames.filter(Boolean).join(space)
  }

  /**
   * Join modifiers with origin class.
   * @returns `"origin-class origin-class--modifier"`
   */
  modify(originClass: BEMElement, ...modifiers: Array<string | number | false | null | undefined>): string {
    if (!originClass) return ""

    modifiers = modifiers.filter(Boolean)
    if (!modifiers.length) return String(originClass)

    const space = " "
    const separator = "--"

    modifiers = modifiers.map(modifier => originClass + separator + modifier)
    return originClass + space + modifiers.join(space)
  }
}

export const bemTil = new BEM

type BEMElement = string | number | false | null | undefined

function bem(classNames: BEMElement | BEMElement[], ...modifiers: (Record<keyof never, boolean | undefined | null | "" | 0> | (BEMElement | BEMElement[]))[]): string {
  const mods = modifiers.flatMap(modifier => isRecord(modifier) ? Object.entries(modifier).reduce((result, [nextKey, nextValue]) => [...result, nextValue && nextKey], [] as any[]) : modifier)

  return bemTil.merge(...castArray(classNames).map(className => bemTil.modify(className, ...mods)))
}

export function bemful(input: StateOrPlain<BEMElement> | StateOrPlain<BEMElement>[], ...mods: any[]): State<string> {
  const classNames = castArray(input)
  const observableMods = mods.flatMap(mod => {
    if (isRecord(mod)) return State.collect(mod)
    if (mod instanceof Array) return State.collect(mod)

    return mod
  })

  return State.combine([State.collect(classNames), ...observableMods], bem)
}
