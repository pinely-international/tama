import { onDemandRef } from "./Inflator/web/helpers"
import { Subscription } from "./Observable"

export class Disposal {
  /** @internal */
  controller = onDemandRef(() => new AbortController)
  get signal() { return this.controller.current.signal }

  add(effect: AbortSignal | Subscription | (() => void)) { }
  adopt(other: Disposal | Disposable) { }
}
