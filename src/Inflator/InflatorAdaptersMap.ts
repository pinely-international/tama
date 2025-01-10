import Inflator from "./Inflator"
import { InflatorAdapterConstructor, InflatorAdapterObject } from "./InflatorAdapter"

class InflatorAdaptersMap extends Map<InflatorAdapterConstructor, InflatorAdapterObject> {
  constructor(private readonly inflator: Inflator, init?: ConstructorParameters<typeof Map<InflatorAdapterConstructor, InflatorAdapterObject>>[0]) { super(init) }

  add(adapter: InflatorAdapterConstructor): this {
    if (!super.has(adapter)) {
      const adapterInstance = new adapter(this.inflator)
      super.set(adapter, adapterInstance)
    }
    return this
  }
}

export default InflatorAdaptersMap
