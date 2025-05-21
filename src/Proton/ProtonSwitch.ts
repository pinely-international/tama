import { Notifier } from "@denshya/reactive"

import { AccessorSet } from "@/Accessor"
import { InflatorAdapter } from "@/Inflator/InflatorAdapter"

import { Unsubscribe } from "../Observable"

/**
 * It can be used both for Component View swapping and as a part of any JSX element.
 * In case of being part of JSX, you should connect `ProtonSwitchWebInflator`.
 *
 * @example
 * function SwitchComponent(this: Proton.Component) {
    const switcher = new ProtonSwitch({
      banned: <span>Banned</span>,
      pending: <span>Pending</span>,
      default: <span>Loading...</span>
    })

    switcher.set("banned") // View will change to <span>Banned</span>.
    switcher.set("pending") // View will change to <span>Pending</span>.
    switcher.set("default") // View will change to <span>Loading...</span>.

    switcher.sets(this.view)
    return switcher.current.value
  }
 * @example
  async function UserProfile() {
    const userStatusSwitch = new Proton.Switch({
      banned: <Status color="red">Banned</Status>,
      pending: <Status color="yellow">Pending</Status>,
      default: <Status color="green">Active</Status>
    })

    const user = await requestCurrentUser()
    user.status.sets(userStatusSwitch)

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
export class ProtonSwitch<T extends Record<keyof never | "default", unknown> = any> {
  private readonly notifier = new Notifier

  readonly current: { key: keyof T, value: T[keyof T] }
  constructor(readonly cases: T | Record<"default", unknown>) {
    this.current = { key: "default", value: cases["default"] as never }
  }

  set(key: keyof T) {
    this.current.key = key
    this.current.value = this.cases[key as never]

    this.notifier.dispatch()
  }

  sets<U>(other: AccessorSet<T[keyof T] | U>): Unsubscribe
  sets(callback: (value: T[keyof T]) => void): Unsubscribe
  sets<U>(arg: AccessorSet<T[keyof T] | U> | ((value: T[keyof T]) => void)): Unsubscribe {
    return this.notifier.subscribe(() => {
      if (arg instanceof Function) {
        arg(this.current.value)
      } else {
        arg.set(this.current.value)
      }
    })
  }

  [Symbol.subscribe](next: () => void) { return this.notifier.subscribe(next) }
}

export class ProtonSwitchWebInflator extends InflatorAdapter {
  inflate(switcher: unknown) {
    if (switcher instanceof ProtonSwitch === false) return

    let previousKey = switcher.current.key
    const inflatedCache: Record<keyof never, unknown> = {
      [switcher.current.key]: this.inflator.inflate(switcher.current.value)
    }

    switcher[Symbol.subscribe](() => {
      if (switcher.current.key in inflatedCache === false) {
        inflatedCache[switcher.current.key] = this.inflator.inflate(switcher.current.value)
      }

      const previousInflated = inflatedCache[previousKey]
      const currentInflated = inflatedCache[switcher.current.key]

      if (previousInflated instanceof Element && currentInflated instanceof Element) {
        previousInflated.replaceWith(currentInflated)
      }

      previousKey = switcher.current.key
    })

    return inflatedCache[switcher.current.key]
  }
}
