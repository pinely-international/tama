// interface DOMConnectionObserverMethods {
//   MutationObserver?: typeof MutationObserver
//   IntersectionObserver?: typeof IntersectionObserver
// }



type ConnectionSet = Set<(connected: boolean) => void> & { connected?: boolean }


interface DOMConnectionObserverEntry {
  readonly isConnected: boolean
  readonly target: Node
}

// /**
//  * @example
//  * const domConnectionObserver = new DOMConnectionObserver(entries => { entries[0].connected, entries.disconnected }, { IntersectionObserver })
//  * domConnectionObserver.observe()
//  */
export class DOMConnectionObserver {
  private static subscriptions = new WeakMap<Node, ConnectionSet>()
  private static watch(entries: ResizeObserverEntry[] | IntersectionObserverEntry[] | MutationRecord[]) {
    // if ("addedNodes" in entries[0]) {
    //   for (const entry of entries as MutationRecord[]) {
    //     entry.addedNodes.forEach(node => this.subscriptions.get(node)?.forEach(callback => callback(true)))
    //     entry.removedNodes.forEach(node => this.subscriptions.get(node)?.forEach(callback => callback(false)))
    //   }

    //   return
    // }

    for (const entry of entries) {
      const subs = this.subscriptions.get(entry.target)
      if (!subs) continue

      const connected = entry.target.isConnected

      if (subs.connected === connected) continue
      subs.connected = connected

      for (const callback of subs) callback(connected)
    }
  }

  // private static mutationObserver = new MutationObserver(x => this.watch(x))
  // static {
  //   this.mutationObserver.observe(document.documentElement, { childList: true, subtree: true })
  // }

  private static observe(node: Node) {
    const subs: ConnectionSet = new Set

    if (node instanceof Element) {
      DOMConnectionObserver.resizeObserver.observe(node)
      DOMConnectionObserver.intersectionObserver.observe(node)
    }

    return subs
  }

  private static unobserve(node: Node) {
    if (node instanceof Element) {
      this.resizeObserver.unobserve(node)
      this.intersectionObserver.unobserve(node)
    }
  }



  private static resizeObserver = new ResizeObserver(this.watch.bind(this))
  private static intersectionObserver = new IntersectionObserver(this.watch.bind(this), { threshold: 0, root: document.body })

  // constructor(private readonly methods: DOMConnectionObserverMethods) { }
  constructor(private readonly callback: (entries: DOMConnectionObserverEntry[]) => void) { }

  observe(target: Node) {
    const subs = DOMConnectionObserver.subscriptions.getOrInsertComputed(target, DOMConnectionObserver.observe)
    subs.add(isConnected => this.callback([{ isConnected, target }]))
  }
  unobserve(node: Node) {
    DOMConnectionObserver.subscriptions.delete(node)
    DOMConnectionObserver.unobserve(node)
  }

  // static for(node: Node): Subscriptable<boolean> { }
}
