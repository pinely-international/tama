import { MountRoutine } from "@/MountRoutine"
import { EffectCleanable, EffectSignal, MountFSM } from "@/MountRoutine.types"
import { describe, it, expect } from "bun:test"


describe("MountRoutine", () => {
  describe("FSM constructor", () => {
    it("initializes with FSM object", () => {
      const calls: string[] = []
      const fsm: MountFSM = {
        onMount: () => calls.push("mount"),
        onUnmount: () => calls.push("unmount"),
      }

      const routine = new MountRoutine(fsm)
      routine.enter()
      routine.exit()

      expect(calls).toEqual(["mount", "unmount"])
    })

    it("handles FSM with only onMount", () => {
      const calls: string[] = []
      const fsm: MountFSM = {
        onMount: () => calls.push("mount"),
      }

      const routine = new MountRoutine(fsm)
      routine.enter()
      routine.exit()

      expect(calls).toEqual(["mount"])
    })

    it("handles FSM with only onUnmount", () => {
      const calls: string[] = []
      const fsm: MountFSM = {
        onUnmount: () => calls.push("unmount"),
      }

      const routine = new MountRoutine(fsm)
      routine.enter()
      routine.exit()

      expect(calls).toEqual(["unmount"])
    })
  })

  describe("EffectCleanable constructor", () => {
    it("executes cleanup function on unmount", () => {
      const calls: string[] = []
      const effect: EffectCleanable = () => {
        calls.push("effect")
        return () => calls.push("cleanup")
      }

      const routine = new MountRoutine(effect)
      routine.enter()
      routine.exit()

      expect(calls).toEqual(["effect", "cleanup"])
    })

    it("does not execute cleanup on second exit", () => {
      const calls: string[] = []
      const effect: EffectCleanable = () => {
        calls.push("effect")
        return () => calls.push("cleanup")
      }

      const routine = new MountRoutine(effect)
      routine.enter()
      routine.exit()
      routine.exit()

      expect(calls).toEqual(["effect", "cleanup"])
    })

    it("can be mounted and unmounted multiple times", () => {
      const calls: string[] = []
      const effect: EffectCleanable = () => {
        calls.push("effect")
        return () => calls.push("cleanup")
      }

      const routine = new MountRoutine(effect)

      routine.enter()
      routine.exit()
      routine.enter()
      routine.exit()

      expect(calls).toEqual(["effect", "cleanup", "effect", "cleanup"])
    })
  })

  describe("EffectSignal constructor", () => {
    it("passes AbortSignal to effect function", () => {
      let capturedSignal: AbortSignal | null = null
      const effect: EffectSignal = (signal) => {
        capturedSignal = signal
      }

      const routine = new MountRoutine(effect)
      routine.enter()

      expect(capturedSignal).toBeInstanceOf(AbortSignal)
      expect(capturedSignal?.aborted).toBe(false)
    })

    it("aborts signal on unmount", () => {
      let capturedSignal: AbortSignal | null = null
      const effect: EffectSignal = (signal) => {
        capturedSignal = signal
      }

      const routine = new MountRoutine(effect)
      routine.enter()
      routine.exit()

      expect(capturedSignal?.aborted).toBe(true)
    })

    it("creates new AbortSignal on each mount", () => {
      const signals: AbortSignal[] = []
      const effect: EffectSignal = (signal) => {
        signals.push(signal)
      }

      const routine = new MountRoutine(effect)
      routine.enter()
      routine.exit()
      routine.enter()

      expect(signals.length).toBe(2)
      expect(signals[0]).not.toBe(signals[1])
      expect(signals[0].aborted).toBe(true)
      expect(signals[1].aborted).toBe(false)
    })

    it("clears AbortController reference on unmount", () => {
      const effect: EffectSignal = (_signal) => { }

      const routine = new MountRoutine(effect)
      routine.enter()
      expect(routine["abortController"]).not.toBeNull()

      routine.exit()
      expect(routine["abortController"]).toBeNull()
    })

    it("handles multiple unmounts gracefully", () => {
      let callCount = 0
      const effect: EffectSignal = (_signal) => {
        callCount++
      }

      const routine = new MountRoutine(effect)
      routine.enter()
      routine.exit()
      routine.exit()

      expect(callCount).toBe(1)
    })
  })

  describe("enter and exit methods", () => {
    it("calls onMount when enter is invoked", () => {
      const calls: string[] = []
      const fsm: MountFSM = {
        onMount: () => calls.push("mount"),
      }

      const routine = new MountRoutine(fsm)
      routine.enter()

      expect(calls).toContain("mount")
    })

    it("calls onUnmount when exit is invoked", () => {
      const calls: string[] = []
      const fsm: MountFSM = {
        onUnmount: () => calls.push("unmount"),
      }

      const routine = new MountRoutine(fsm)
      routine.exit()

      expect(calls).toContain("unmount")
    })

    it("can call enter and exit multiple times", () => {
      const calls: string[] = []
      const fsm: MountFSM = {
        onMount: () => calls.push("mount"),
        onUnmount: () => calls.push("unmount"),
      }

      const routine = new MountRoutine(fsm)
      routine.enter()
      routine.exit()
      routine.enter()
      routine.exit()

      expect(calls).toEqual(["mount", "unmount", "mount", "unmount"])
    })
  })
})
