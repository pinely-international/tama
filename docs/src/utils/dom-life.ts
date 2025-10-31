/** Describes special usage of `Set`. */
type ConnectionSet = Set<(connected: boolean) => void> & { connected?: boolean }

export namespace NodeConnection {
  const elementsSubscriptions = new WeakMap<Element, ConnectionSet>()
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const callbackSet = elementsSubscriptions.get(entry.target)!
      const connected = entry.target.isConnected

      // Debounce duplicated notifications.
      if (callbackSet.connected === connected) continue
      callbackSet.connected = connected

      window.requestAnimationFrame(() => {
        for (const callback of callbackSet) callback(connected)
      })
    }
  })
  const intersectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const callbackSet = elementsSubscriptions.get(entry.target)!
      const connected = entry.target.isConnected

      // Debounce duplicated notifications.
      if (callbackSet.connected === connected) continue
      callbackSet.connected = connected

      window.requestAnimationFrame(() => {
        for (const callback of callbackSet) callback(connected)
      })
    }
  })

  export function track(element: Element) {
    return {
      subscribe: (next: (value: boolean) => void) => {
        let subs = elementsSubscriptions.get(element)
        if (subs == null) {
          subs = new Set

          elementsSubscriptions.set(element, subs)
          resizeObserver.observe(element)
          intersectionObserver.observe(element)
        }

        subs.add(next)
      }
    }
  }
  export function whenConnected(element: Element) {
    return {
      subscribe: (next: () => void) => track(element).subscribe(connected => connected && next())
    }
  }
  export function whenDisconnected(element: Element) {
    return {
      subscribe: (next: () => void) => track(element).subscribe(connected => !connected && next())
    }
  }





  export function use(element: Element, effect: () => () => void) {
    let effectCleanup: (() => void) | null = null
    return track(element).subscribe(connected => {
      if (connected) {
        effectCleanup = effect()
      } else {
        effectCleanup?.()
      }
    })
  }
  export function useAbortable(element: Element, connectedCallback: (disconnectedSignal: AbortSignal) => void) {
    let abortController = new AbortController
    return track(element).subscribe(connected => {
      if (connected) {
        abortController = new AbortController
        connectedCallback(abortController.signal)
      } else {
        abortController.abort()
      }
    })
  }
}
