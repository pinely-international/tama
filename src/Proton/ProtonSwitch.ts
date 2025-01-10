import { FlowRead, Signal } from "@denshya/flow"

import { InflatorAdapter } from "@/Inflator/InflatorAdapter"

import { Unsubscribe } from "../Observable"

/**
 * @example
  function UserProfile() {
    const userStatusSwitch = new Proton.Switch({
      banned: <Status color="red">Banned</Status>,
      pending: <Status color="yellow">Pending</Status>,
      default: <Status color="green">Active</Status>
    })
    userStatusSwitch.observer.set(user.status)

    return (
      <div>
        ...
        <div>Status: {userStatusSwitch}</div>
        ...
      </div>
    )
  }
 *
 */
class ProtonSwitch<T extends Record<keyof never | "default", unknown> = any> {
  constructor(readonly cases: T | Record<"default", unknown>) {
    let subscription: Unsubscribe | null = null

    this.observer[Symbol.subscribe](signal => {
      subscription?.unsubscribe()
      subscription = signal[Symbol.subscribe](status => this.selected.set(status))
    })

    this.active = new Signal(cases["default"]) as never
    this.selected[Symbol.subscribe](it => this.active.set(cases[it as never]))
  }

  readonly selected = new Signal<keyof T>("default")
  readonly observer = new Signal<FlowRead<keyof T>>(this.selected)
  readonly active: Signal<T[keyof T]>
}



export { }

class ProtonSwitchWebInflator extends InflatorAdapter {
  test(value: unknown) { return value instanceof ProtonSwitch }
  inflate(switcher: unknown) {
    if (switcher instanceof ProtonSwitch === false) return null

    const current = this.inflator.inflate(switcher.active.get())

    const inflationMap = {
      [switcher.selected.get()]: current
    }

    switcher.active[Symbol.subscribe](it => {
      const nextCase = switcher.cases[it]

    })

    return current
  }
}

// { new ProtonSwitchWebInflator().adapt(new ProtonSwitch({ default: 1 })) }
