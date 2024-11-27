import Events from "./Events"
import { Inflator } from "./Inflator"
import ProtonJSX from "./ProtonJSX"
import ProtonTreeAPI from "./ProtonTreeAPI"

declare global {
  namespace JSX {
    interface ElementTypeConstructor {
      (this: never, props: any): void | Promise<void>
    }
  }
}

namespace Proton {
  export interface ShellConstructor { }

  export const JSX = ProtonJSX
  export function Componentus(this: Shell) { return this }

  export class Shell {
    public readonly tree: ProtonTreeAPI
    private readonly events = new Events

    private view: unknown = null
    private viewCallbacks = new Set<() => void>()

    constructor(readonly inflator: Inflator) {
      this.tree = {
        set: subject => {
          const object = this.inflator.inflate(subject)

          this.view = object
          this.viewCallbacks.forEach(callback => callback())
        },
        detach: () => this.events.dispatch("detach"),
        transit: subject => document.startViewTransition(() => this.tree.set(subject))
      }
    }

    onViewChange(callback: (view: unknown) => void) {
      const viewCallback = () => callback(this.view)

      this.viewCallbacks.add(viewCallback)
      return () => void this.viewCallbacks.delete(viewCallback)
    }

    getView() { return this.view }
    on(event: string) { return this.events.observe(event) }
  }
}

export default Proton
