import { Flow, Flowable } from "@denshya/flow"
import { castArray, isRecord } from "./common"

class BEM {
  /**
   *
   * @returns `class1 class2`
   */
  merge(...classNames: Array<BEMElement>): string {
    const space = " "
    console.log(classNames)
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
  const mods = modifiers.flatMap(modifier => isRecord(modifier) ? Object.entries(modifier).reduce((result, [nextKey, nextValue]) => [...result, nextValue && nextKey], []) : modifier)

  return bemTil.merge(...castArray(classNames).map(className => bemTil.modify(className, ...mods)))
}

export const bemFlow = (classNames: Flowable<BEMElement> | Flowable<BEMElement>[], ...mods) => {
  const classNamesFlows = castArray(classNames).map(Flow.from)
  const modsFlows = mods.map(mod => {
    if (isRecord(mod)) return Flow.computeRecord(mod)
    if (mod instanceof Array) return Flow.all(mod)

    return mod
  })

  return Flow.compute(bem, [Flow.all(classNamesFlows), ...modsFlows])
}
