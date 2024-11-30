import Events from "./Events"
import { Inflator } from "./Inflator"
import ProtonJSX from "./ProtonJSX"
import ProtonViewAPI from "./ProtonTreeAPI"
import TreeContextAPI from "./TreeContextAPI"

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
    public readonly view: ProtonViewAPI
    public readonly inflator: Inflator
    public readonly context: TreeContextAPI

    private readonly events = new Events

    private viewElement: unknown = null
    private viewCallbacks = new Set<() => void>()



    constructor(inflator: Inflator, parent?: Shell) {
      this.inflator = cloneInstance(inflator)
      this.inflator.parentShell = this

      // this.inflator.createComponent()

      this.context = new TreeContextAPI(parent?.context)

      let previousView: unknown
      this.view = {
        set: subject => {
          try {
            const object = this.inflator.inflate(subject)

            if (subject !== previousView) {
              previousView = this.viewElement
            }

            this.viewElement = object
            this.viewCallbacks.forEach(callback => callback())
          } catch (thrown) {
            if (this.inflator.catchCallback != null) return void this.inflator.catchCallback(thrown)

            throw thrown
          }
        },
        reset: () => this.view.set(previousView),
        detach: () => this.events.dispatch("detach"),
        transit: subject => document.startViewTransition(() => this.view.set(subject)),
      }
    }

    catch<T>(catchCallback: (thrown: T) => void) { this.inflator.catchCallback = catchCallback }
    /**
     * Calls passed `callback` just before the component is going to be suspended.
     * Batches any down tree suspensions together while there are some unresolved.
     *
     * The `callback` can be used to set a temporary `view`.
     *
     * When the component is unsuspended, all the effects applied in the `callback` are reverted by a built-in mechanism.
     */
    suspense<T = void>(callback: (result: T) => void) { this.inflator.suspenseCallback = callback }
    unsuspense<T = void>(callback: (result: T) => void) { this.inflator.unsuspenseCallback = callback }

    onViewChange(callback: (view: unknown) => void) {
      const viewCallback = () => callback(this.viewElement)

      this.viewCallbacks.add(viewCallback)
      return () => void this.viewCallbacks.delete(viewCallback)
    }

    getView() { return this.viewElement }
    on(event: string) { return this.events.observe(event) }
  }
}

export default Proton

function cloneInstance<T>(origin: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(origin)), origin)
}
