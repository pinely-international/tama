import { Inflator } from "./Inflator"
import Null from "./Null"
import ProtonJSX from "./ProtonJSX"
import ProtonTreeAPI from "./ProtonTreeAPI"

declare global {
  namespace JSX {
    interface ElementTypeConstructor {
      (this: never, props: {}): void | Promise<void>
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

    asd() {
      let anchor: Node
      let anchorChildren: Node[] = Null.ARRAY

      if (this.view instanceof DocumentFragment) {
        anchor = this.view
        anchorChildren = [...this.view.childNodes]
      } else if (this.view instanceof Node) {
        anchor = this.view
      } else {
        const comment = document.createComment(this.constructor.name)
        anchor = comment
      }

      let lastAnimationFrame = -1

      this.onViewChange(view => {
        if (view instanceof Node === false) return

        // Assume that the anchor node was already connected.
        const schedule = () => {
          if (anchor instanceof Node === false) return

          const anchorFirstChild = anchorChildren.shift()
          if (anchorFirstChild == null) {
            anchor.replaceWith(view)
            anchor = view

            return
          }

          const anchorFirstChildParent = anchorFirstChild instanceof Node && anchorFirstChild.parentElement
          if (!anchorFirstChildParent) return

          anchorChildren.forEach(rest => anchorFirstChildParent.removeChild(rest as never))

          anchor = view
          anchorChildren = [...view.childNodes]

          anchorFirstChildParent.replaceChild(view, anchorFirstChild)
        }

        cancelAnimationFrame(lastAnimationFrame)
        lastAnimationFrame = requestAnimationFrame(schedule)
      })

      return anchor as never
    }
  }
}

export default Proton
