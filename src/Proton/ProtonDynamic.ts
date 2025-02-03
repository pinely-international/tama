import { Flowable, Signal } from "@denshya/flow"

import ProtonJSX from "@/jsx/ProtonJSX"

import { ProtonShell } from "./ProtonShell"

/**
 *
 *
 * @example Dynamic(CharacterForm, { character })
 */
export function ProtonDynamic<Props>(componentFactory: (props: Props) => unknown, props: { [K in keyof Props]: Flowable<Props[K]> }) {
  const results = new Map<unknown[], unknown>()
  const resultsAge = new Map<unknown[], number>()

  function getCachedFactory(shell: ProtonShell, props: any) {
    const propsValues = Object.values(props).sort()

    const cachedResultKey = results.keys().find(oldPropsValues => arrayEquals(propsValues, oldPropsValues))
    if (cachedResultKey != null) {
      const cachedResult = results.get(cachedResultKey)

      const keyAge = resultsAge.get(cachedResultKey) ?? 0
      if (keyAge < Date.now()) {
        results.delete(cachedResultKey)
        resultsAge.delete(cachedResultKey)
      }

      return cachedResult
    }

    const newResult = shell.inflator.inflate(componentFactory(props))

    results.set(propsValues, newResult)
    resultsAge.set(propsValues, Date.now() + SECONDS_100)

    return newResult
  }

  function DynamicComponent(this: ProtonShell) {
    const propsState = Signal.computeRecord(props)
    propsState.sets(it => this.view.set(getCachedFactory(this, it)))
    return getCachedFactory(this, propsState.get())
  }

  DynamicComponent.for = componentFactory.name
  return ProtonJSX.Element(DynamicComponent, null, null)
}


const SECONDS_100 = 1_000_000

function arrayEquals(a: unknown[], b: unknown[]) {
  return a.length === b.length && a.every((aItem, i) => aItem === b[i])
}
