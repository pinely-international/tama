import Inflator from "./Inflator"
import { InflatorAdapter } from "./InflatorAdapter"

class InflatorAdaptersMap extends Map<typeof InflatorAdapter, InflatorAdapter> {
  constructor(private readonly inflator: Inflator, init?: ConstructorParameters<typeof Map<typeof InflatorAdapter, InflatorAdapter>>[0]) { super(init) }

  add(adapter: typeof InflatorAdapter): this {
    if (!this.has(adapter)) {
      // @ts-expect-error assume this is non-abstract constructor.
      const adapterInstance = new adapter(this.inflator)
      this.set(adapter, adapterInstance)
    }
    return this
  }
}

export default InflatorAdaptersMap
