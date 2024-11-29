import Events from "./Events"
import Observable from "./Observable"

type TreeContext = new (...args: never[]) => unknown

class TreeContextError extends Error { }

class TreeContextAPI {
  private readonly contexts = new Map<TreeContext, InstanceType<TreeContext>>()

  constructor(readonly parent?: TreeContextAPI) { }

  provide<T extends InstanceType<TreeContext>>(context: T extends TreeContext ? never : T): T {
    this.contexts.set(context.constructor, context)
    return context
  }
  find<T extends TreeContext>(context: T): InstanceType<T> | null {
    const instance = this.contexts.get(context)
    if (instance != null) return instance as InstanceType<T>

    if (this.parent != null) return this.parent.find(context)

    return null
  }
  /**
   * @throws {TreeContextError}
   */
  require<T extends TreeContext>(context: T): InstanceType<T> {
    const instance = this.find(context)
    if (instance == null) throw new TreeContextError("No context is provided up the component tree")

    return instance
  }
  for<T extends TreeContext>(context: T): Events<{ add(): Observable<InstanceType<T>>, remove(): Observable<void> }> { }
}

export default TreeContextAPI
