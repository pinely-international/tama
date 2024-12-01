import Observable from "./Observable"

interface ActBindingOff {
  (): void

  readonly source: object
  readonly target: object
  readonly property: string
}

type ActProperty<T extends object, K extends keyof T> = T[K] extends { [Symbol.subscribe]: unknown } ? K : never

class ActBindings<Source extends object> {
  private readonly offs: WeakMap<object, Map<keyof never, ActBindingOff>> = new WeakMap

  constructor(readonly source: Source) { }

  set<Target extends object>(target: Target, property: ActProperty<Target, keyof Target>) {
    const act = target[property] as Observable<unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const off = act[Symbol.subscribe](value => (this.source as any)[property] = value)
    return off
  }
  unset<Target extends object>(target: Target, property: ActProperty<Target, keyof Target>) {
    const targetOffs = this.offs.get(target)
    const off = targetOffs?.get(property)

    off?.()
  }
}

export default ActBindings
