import { Inflator } from "./Inflator"
import ProtonJSX from "./ProtonJSX"
import ProtonTreeAPI from "./ProtonTreeAPI"

declare global {
  namespace JSX {
    interface ElementTypeConstructor {
      (this: Proton.Shell): typeof this | Promise<typeof this>
    }
  }
}

namespace Proton {
  export interface ShellConstructor { }

  export const JSX = ProtonJSX
  export function Componentus(this: Shell) { return this }

  export class Shell {
    public readonly tree: ProtonTreeAPI
    public view: unknown = null
    private viewCallbacks = new Set<() => void>()

    constructor(private readonly inflator: Inflator) {
      this.tree = {
        set: subject => {
          const object = this.inflator.inflate(subject)

          this.view = object
          this.viewCallbacks.forEach(callback => callback())
        }
      }
    }

    onViewChange(callback: (view: unknown) => void) {
      const viewCallback = () => callback(this.view)

      this.viewCallbacks.add(viewCallback)
      return () => void this.viewCallbacks.delete(viewCallback)
    }
  }

}

export default Proton
