import { EffectCleanable, EffectSignal, MountFSM } from "./MountRoutine.types"

export class MountRoutine {
  private readonly fsm: MountFSM = {}
  // private adopted?: Set<MountFSM>
  private abortController: AbortController | null = null

  constructor(fsm: MountFSM)
  constructor(effectCleanable: EffectCleanable)
  constructor(effectSignal: EffectSignal)
  constructor(arg: MountFSM | EffectCleanable | EffectSignal) {
    if (typeof arg === "function") {
      // EffectSignal
      if (arg.length === 1) {
        this.fsm.onMount = () => {
          this.abortController?.abort()
          this.abortController = new AbortController

          arg(this.abortController.signal) as EffectSignal
        }
        this.fsm.onUnmount = () => {
          this.abortController?.abort()
          this.abortController = null
        }
        return
      }

      // EffectCleanable
      this.fsm.onMount = () => {
        const cleanup = (arg as EffectCleanable)()
        this.fsm.onUnmount = () => {
          cleanup()
          this.fsm.onUnmount = undefined
        }
      }

      return
    }

    // FSM
    this.fsm = { ...arg }
  }

  enter() {
    this.fsm.onMount?.()
    // this.adopted?.forEach(x => x.onMount?.())
  }
  exit() {
    this.fsm.onUnmount?.()
    // this.adopted?.forEach(x => x.onUnmount?.())
  }



  // adopt(other: MountRoutine) {
  //   this.adopted ??= new Set
  //   this.adopted.add(other.fsm)
  // }
}
