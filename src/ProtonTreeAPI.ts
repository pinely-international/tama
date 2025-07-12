import { Emitter } from "@denshya/reactive"

import Null from "./Null"
import { ProtonComponent } from "./Proton/ProtonComponent"

// interface ProtonViewAPI {
//   default: unknown

//   set(subject: unknown): void
//   setPrevious(): void
//   // transit(subject: unknown): ViewTransition
//   // /**
//   //  * Removes the view tree from document, but saves the reference to the anchor elements - the next `set` will work.
//   //  */
//   // detach(): void
//   // catch(catchClause: (thrown: unknown) => void): void
// }



interface ViewEvents {
  connect: void
  disconnect: void

  init: void
  dispose: void

  change: unknown
}

class ViewAPI {
  private lastSubject: unknown = {} // Ensures first subject to be different.
  private previousView: unknown = null

  /** @internal */
  default: unknown = null
  current: unknown = null

  private readonly events = new Emitter<ViewEvents>()

  constructor(private readonly component: ProtonComponent) { }

  set(subject: unknown) {
    if (subject === this.lastSubject) return
    if (subject === this.current) return

    this.lastSubject = subject

    try {
      const nextView = this.component.inflator.inflate(subject)

      if (nextView !== this.previousView) {
        this.previousView = this.current ?? nextView
      }

      this.current = nextView
      this.events.dispatch("change", nextView)
    } catch (thrown) {
      // @ts-expect-error internal.
      const catchCallback = this.component.catchCallback
      if (catchCallback != null) return void catchCallback(thrown)

      throw thrown
    }
  }
  setPrevious() {
    this.set(this.previousView)
  }

  life(subscribe: (view: unknown) => void | (() => void)) {
    this.events.when("connect").subscribe(() => {
      const unsubscribe = subscribe(this.current) ?? Null.FUNCTION
      this.events.once("disconnect", unsubscribe)
    })
  }
}

export default ViewAPI
