import { Messager } from "@denshya/reactive"

import Inflator from "@/Inflator/Inflator"
import TreeContextAPI from "@/TreeContextAPI"

import ViewAPI from "../ProtonViewAPI"


export class ProtonComponent {
  public readonly view: ViewAPI
  public readonly tree: TreeAPI
  public readonly inflator: Inflator
  private isMounted = false
  private cleanupCallbacks: (() => void)[] = []

  constructor(inflator: Inflator, parent?: ProtonComponent) {
    this.inflator = Inflator.cloneWith(inflator, this)
    this.view = new ViewAPI
    this.tree = new TreeAPI(parent?.tree)
    
    // Set up lifecycle management
    this.setupLifecycle()
  }

  /**
   * Set up component lifecycle management
   */
  private setupLifecycle() {
    // Mark as mounted when view is first set
    this.view.subscribe(() => {
      if (!this.isMounted) {
        this.isMounted = true
        this.onMount()
      }
    })

    // Set up cleanup on unmount
    // Note: Life class may not have onUnmount method, so we'll handle cleanup differently
    // This could be enhanced when Life class is properly implemented
  }

  /**
   * Called when component is mounted
   */
  protected onMount() {
    // Override in subclasses if needed
  }

  /**
   * Called when component is unmounted
   */
  protected onUnmount() {
    this.cleanup()
  }

  /**
   * Add a cleanup callback
   */
  addCleanup(callback: () => void) {
    this.cleanupCallbacks.push(callback)
  }

  /**
   * Clean up resources and clear template cache
   */
  cleanup() {
    // Run cleanup callbacks
    for (const callback of this.cleanupCallbacks) {
      try {
        callback()
      } catch (error) {
        console.error("Cleanup callback error:", error)
      }
    }
    this.cleanupCallbacks.length = 0

    // Clear template cache to prevent memory leaks
    this.view.clearTemplate()
    
    this.isMounted = false
  }

  /**
   * Check if component is mounted
   */
  get mounted(): boolean {
    return this.isMounted
  }
}

class TreeAPI {
  public readonly context: TreeContextAPI

  /** @internal */
  readonly thrown = new Messager<unknown>

  constructor(private readonly parent?: TreeAPI) {
    this.context = new TreeContextAPI(this.parent?.context)

    parent?.thrown.subscribe(this.thrown.dispatch.bind(this.thrown))
  }

  /** @internal */
  caught(thrown: unknown) { this.thrown.dispatch(thrown) }
  catch(callback: (thrown: unknown) => void) { void this.thrown.subscribe(callback) }
}
