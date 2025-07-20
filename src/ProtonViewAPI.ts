import { Messager } from "@denshya/reactive"

import { AsyncGeneratorFunction } from "./BuiltinObjects"
import Inflator from "./Inflator/Inflator"



// interface ViewEvents {
//   connect: void
//   disconnect: void

//   // init: void
//   // dispose: void

//   // change: unknown
// }

// class ViewAPI {
//   private lastSubject: unknown = {} // Ensures first subject to be different.
//   private previousView: unknown = null

//   public default: unknown = null
//   private current: unknown = null

//   private readonly events = new Emitter<ViewEvents>()

//   constructor(private readonly component: ProtonComponent) { }

//   set(subject: unknown) {
//     if (subject === this.lastSubject) return
//     if (subject === this.current) return

//     this.lastSubject = subject

//     try {
//       const nextView = this.component.inflator.inflate(subject)

//       if (nextView !== this.previousView) {
//         this.previousView = this.current ?? nextView
//       }

//       this.current = nextView
//       this.events.dispatch("change", nextView)
//     } catch (thrown) {
//       // @ts-expect-error internal.
//       const catchCallback = this.component.catchCallback
//       if (catchCallback != null) return void catchCallback(thrown)

//       throw thrown
//     }
//   }
//   setPrevious() {
//     this.set(this.previousView)
//   }

//   get(): unknown { return this.current }

//   when<E extends keyof ViewEvents>(event: E): Subscriptable<ViewEvents[E]> { return this.events.when(event) }

//   life(subscribe: (view: unknown) => void | (() => void)) {
//     this.events.when("connect").subscribe(() => {
//       const unsubscribe = subscribe(this.current) ?? Null.FUNCTION
//       this.events.once("disconnect", unsubscribe)
//     })
//   }
// }

class ProtonViewAPI {
  constructor(private readonly inflator: Inflator) { }

  protected messager = new Messager<unknown>
  protected value: unknown = null

  declare default: unknown
  get current() { return this.value }

  get() { return this.value }
  set(nextView: unknown): void {
    this.value = nextView
    this.messager.dispatch(nextView)
  }

  subscribe(callback: (value: unknown) => void) { return this.messager.subscribe(callback) }

  async setFromIterable(iterable: AsyncIterator<unknown>) {
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
      this.setFromIterable(returnResult as any)

      if (this.current != null) {
        // Only assign default if generator was explicitly returned.
        this.default = this.current
      }

      return
    }

    if (returnResult instanceof Promise) returnResult = await returnResult

    this.default = this.inflator.inflate(returnResult)
    this.set(this.default)
  }
}

// interface ProtonViewItem {
//   original: unknown
//   inflated: unknown
// }

export default ProtonViewAPI
