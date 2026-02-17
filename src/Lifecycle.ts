
import { EffectCleanable, EffectSignal, FSM } from "./Lifecycle.types"

export class Lifecycle {
  private readonly fsm: FSM = {}
  private abortController: AbortController | null = null

  constructor(fsm: FSM)
  constructor(effectCleanable: EffectCleanable)
  constructor(effectSignal: EffectSignal)
  constructor(arg: FSM | EffectCleanable | EffectSignal) {
    if (typeof arg === "function") {
      // EffectSignal
      if (arg.length === 1) {
        this.fsm.onEnter = () => {
          this.abortController?.abort()
          this.abortController = new AbortController

          arg(this.abortController.signal) as EffectSignal
        }
        this.fsm.onExit = () => {
          this.abortController?.abort()
          this.abortController = null
        }
        return
      }

      // EffectCleanable
      this.fsm.onEnter = () => {
        this.fsm.onExit = () => {
          (arg as EffectCleanable)()
          this.fsm.onExit = undefined
        }
      }

      return
    }

    // FSM
    this.fsm = { ...arg }
  }

  enter() {
    this.fsm.onEnter?.()
  }
  exit() {
    this.fsm.onExit?.()
  }
}

// const items = new Set<Lifecycle>
// items.add(new Lifecycle(() => { }))

// class LifecycleManager {
//   private readonly items = new Set<Lifecycle>

// add(lifecycle: Lifecycle): void { this.items.add(lifecycle) }

// adopt(fsm: FSM): void
// adopt(effectCleanable: EffectCleanable): void
// adopt(effectSignal: EffectSignal): void
// adopt(arg: FSM | EffectCleanable | EffectSignal) { }
// }
