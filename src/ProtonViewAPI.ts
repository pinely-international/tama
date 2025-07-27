import { EventSignal } from "@denshya/reactive"

import { AsyncGeneratorFunction } from "./BuiltinObjects"
import { Life } from "./Life"



class ViewAPI extends EventSignal<unknown> {
  readonly life = new Life

  declare default: unknown

  constructor() {
    super(null)
  }

  async setIterable(iterable: Iterator<unknown> | AsyncIterator<unknown>) {
    let yieldResult: IteratorResult<unknown> = { done: false, value: undefined }
    while (yieldResult.done === false) {
      yieldResult = await iterable.next()
      this.set(yieldResult.value)
    }
  }

  /** @internal */
  async initWith(returnResult: unknown) {
    if (returnResult == null) return
    if (returnResult instanceof AsyncGeneratorFunction) {
      this.setIterable(returnResult as any)

      if (this.current != null) {
        // Only assign default if generator was explicitly returned.
        this.default = this.current
      }

      return
    }

    if (returnResult instanceof Promise) returnResult = await returnResult

    this.default = returnResult
    this.set(this.default)
  }
}

export default ViewAPI
