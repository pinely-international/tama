import { DOMConnectionObserver } from "./DOMConnectionObserver"
import { MountRoutine } from "./MountRoutine"

export class MountObserver {
  private static routines = new Map<Node, MountRoutine>
  private static observer = new DOMConnectionObserver(entries => {
    entries.forEach(entry => {
      const routine = this.routines.get(entry.target)

      if (entry.isConnected === true) routine?.enter()
      if (entry.isConnected === false) routine?.exit()
    })
  })
  static with(routine: MountRoutine) {
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
