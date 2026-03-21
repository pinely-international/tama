import { DOMConnectionObserver } from "./DOMConnectionObserver"
import { Lifecycle } from "./Lifecycle"

export class MountObserver {
  private static routines = new Map<Node, Lifecycle>
  private static observer = new DOMConnectionObserver(entries => {
    entries.forEach(entry => {
      const routine = this.routines.get(entry.target)

      if (entry.isConnected === true) routine?.enter()
      if (entry.isConnected === false) routine?.exit()
    })
  })
  static with(routine: Lifecycle) {
    return (node: Node) => {
      this.routines.set(node, routine)
      this.observer.observe(node)

      return () => {
        this.routines.delete(node)
        this.observer.unobserve(node)
      }
    }
  }
}
