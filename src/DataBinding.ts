interface BindingOff {
  (): void

  readonly source: object
  readonly target: object
  readonly property: string
}

class PropertyBindings<Source extends object> {
  private readonly offs: WeakMap<object, Map<keyof Source, BindingOff>> = new WeakMap
  private readonly setters: Map<keyof Source, (() => void)[]> = new Map


  constructor(readonly source: Source) { }


  set<Target extends Partial<Source>>(target: Target, property: keyof Source) {
    const targetOffs = this.offs.get(target) ?? new Map
    if (targetOffs.has(property)) return

    const hasSetters = this.setters.has(property)
    if (hasSetters == null) {
      const setters = this.setters.set(property, [])

      Object.defineProperty(this.source, property, {
        get: () => this
      })
    }

    const off = () => { }
    off.source = this.source
    off.target = target
    off.property = property

    targetOffs.set(property, off)
  }

  unset(target: object, property: keyof Source) {
    const targetOffs = this.offs.get(target)
    const off = targetOffs?.get(property)

    off?.()
  }
}

export default PropertyBindings


const element = document.createElement("div")
const props = { test: "meow" }

const bindings = new PropertyBindings(element)
bindings.set(props, "test")

let i = 0
setInterval(() => props.test = "meow " + i++, 1000)
