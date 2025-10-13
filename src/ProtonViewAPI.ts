import { State } from "@denshya/reactive"

import { AsyncGeneratorPrototype } from "./BuiltinObjects"
import { Life } from "./Life"
import TransitionAPI, { type ViewTransitionEntry } from "./TransitionAPI"

interface TemplateInfo {
  template: Node
  dynamicZones: Map<string, Node[]>
  eventBindings: Map<Node, Map<string, EventListenerOrEventListenerObject[]>>
  isStale: boolean
}
import type { ProtonComponent } from "./Proton/ProtonComponent"

class ViewAPI extends State<unknown> {
  readonly life = new Life

  declare default: unknown
  private templateCache: TemplateInfo | null = null
  private templateEnabled = true

  private component?: ProtonComponent
  private readonly transitionsApi = new TransitionAPI
  private transitionQueue: Promise<void> = Promise.resolve()
  private hasCommitted = false

  constructor() {
    super(null)
  }

  get transitions(): TransitionAPI {
    return this.transitionsApi
  }
  set transitions(entries: TransitionAPI | Iterable<ViewTransitionEntry> | null | undefined) {
    if (entries instanceof TransitionAPI) {
      this.transitionsApi.replaceWith(entries)
      return
    }

    this.transitionsApi.replaceWith(entries)
  }

  attach(component: ProtonComponent) {
    this.component = component
  }

  async setIterable(iterable: Iterator<unknown> | AsyncIterator<unknown>) {
    let yieldResult: IteratorResult<unknown> = { done: false, value: undefined }
    while (yieldResult.done === false) {
      yieldResult = await iterable.next()
      await this.scheduleTransition(yieldResult.value)
    }
  }

  set(value: unknown) {
    void this.scheduleTransition(value)
  }

  /** @internal */
  async initWith(returnResult: unknown) {
    if (returnResult == null) return
    if (returnResult.constructor === AsyncGeneratorPrototype) {
      await this.setIterable(returnResult as any)

      if (this.current != null) {
        // Only assign default if generator was explicitly returned.
        this.default ??= this.current
      }

      return
    }

    if (returnResult instanceof Promise) returnResult = await returnResult

    this.default = returnResult
    await this.scheduleTransition(this.default)
  }

  private commit(value: unknown) {
    super.set(value)
    this.hasCommitted = true
  }

  private scheduleTransition(next: unknown): Promise<void> {
    if (this.hasCommitted === false) {
      this.commit(next)
      return Promise.resolve()
    }

    const previous = this.current
    if (Object.is(previous, next)) return Promise.resolve()

    this.transitionsApi.markPending(previous, next)

    const job = async () => {
      try {
        await this.applyTransitions(previous, next)
      } catch (error) {
        console.error("View transition failed", error)
        this.commit(next)
      }
    }

    const scheduled = this.transitionQueue.then(job, job)
    this.transitionQueue = scheduled.catch(() => undefined)
    return scheduled.then(() => undefined)
  }

  private async applyTransitions(previous: unknown, next: unknown) {
    if (this.transitionsApi.size === 0) {
      this.commit(next)
      return
    }

    this.transitionsApi.markRunning(previous, next)

    const transitions = Array.from(this.transitionsApi)
    let pipeline = async () => { this.commit(next) }

    for (let i = transitions.length - 1; i >= 0; i -= 1) {
      const nextStage = pipeline
      const transition = transitions[i]

      pipeline = async () => {
        await this.executeTransition(transition, previous, next, nextStage)
      }
    }

    try {
      await pipeline()
    } finally {
      this.transitionsApi.markFinished()
    }
  }

  private async executeTransition(
    transition: ViewTransitionEntry,
    previous: unknown,
    next: unknown,
    nextStage: () => Promise<void>
  ) {
    let advanced = false
    const transit = async () => {
      if (advanced) return
      advanced = true
      await nextStage()
    }

    try {
      const context = this.resolveTransitionContext(transition)
      const callable = transition as unknown as (this: unknown, transit: () => Promise<void>, previous: unknown, next: unknown) => unknown
      const result = callable.call(context, transit, previous, next)
      await this.awaitTransitionResult(result)
    } catch (error) {
      console.error("View transition handler failed", error)
    } finally {
      await transit()
    }
  }

  private async awaitTransitionResult(result: unknown) {
    if (result == null) return

    if (result instanceof Promise) {
      await result
      return
    }

    if (typeof result === "object") {
      const awaiting = ["finished", "ready", "updateCallbackDone", "committed", "done"]
        .map(property => (result as Record<string, unknown>)[property])
        .filter((value): value is Promise<unknown> => value instanceof Promise)

      if (awaiting.length > 0) await Promise.allSettled(awaiting)
    }
  }

  private resolveTransitionContext(transition: ViewTransitionEntry) {
    if (typeof document !== "undefined" && document?.startViewTransition != null && transition === document.startViewTransition) {
      return document
    }

    return this.component ?? this
  }

  /**
   * Enable or disable template-based rendering for this component
   */
  setTemplateEnabled(enabled: boolean) {
    this.templateEnabled = enabled
    if (!enabled) {
      this.clearTemplate()
    }
  }

  /**
   * Check if template is available and not stale
   */
  hasValidTemplate(): boolean {
    return this.templateCache !== null && !this.templateCache.isStale
  }

  /**
   * Get the cached template if available
   */
  getTemplate(): TemplateInfo | null {
    return this.templateCache
  }

  /**
   * Set a new template with dynamic zones and event bindings
   */
  setTemplate(template: Node, dynamicZones: Map<string, Node[]> = new Map(), eventBindings: Map<Node, Map<string, EventListenerOrEventListenerObject[]>> = new Map()) {
    this.templateCache = {
      template: template.cloneNode(true) as Node, // Deep clone for safety
      dynamicZones: new Map(dynamicZones),
      eventBindings: new Map(eventBindings),
      isStale: false
    }
  }

  /**
   * Mark template as stale (needs regeneration)
   */
  markTemplateStale() {
    if (this.templateCache) {
      this.templateCache.isStale = true
    }
  }

  /**
   * Clear the template cache
   */
  clearTemplate() {
    this.templateCache = null
  }

  /**
   * Clone the template for hydration
   */
  cloneTemplate(): { node: Node, dynamicZones: Map<string, Node[]>, eventBindings: Map<Node, Map<string, EventListenerOrEventListenerObject[]>> } | null {
    if (!this.templateCache) return null

    const clonedNode = this.templateCache.template.cloneNode(true) as Node
    const clonedDynamicZones = new Map<string, Node[]>()
    const clonedEventBindings = new Map<Node, Map<string, EventListenerOrEventListenerObject[]>>()

    // Clone dynamic zones mapping
    for (const [zoneId, nodes] of this.templateCache.dynamicZones) {
      const clonedNodes: Node[] = []
      for (const node of nodes) {
        // Find corresponding node in cloned tree
        const correspondingNode = this.findCorrespondingNode(clonedNode, node)
        if (correspondingNode) clonedNodes.push(correspondingNode)
      }
      clonedDynamicZones.set(zoneId, clonedNodes)
    }

    // Clone event bindings mapping
    for (const [node, bindings] of this.templateCache.eventBindings) {
      const correspondingNode = this.findCorrespondingNode(clonedNode, node)
      if (correspondingNode) {
        clonedEventBindings.set(correspondingNode, new Map(bindings))
      }
    }

    return {
      node: clonedNode,
      dynamicZones: clonedDynamicZones,
      eventBindings: clonedEventBindings
    }
  }

  /**
   * Find corresponding node in cloned tree by comparing structure
   */
  private findCorrespondingNode(clonedRoot: Node, originalNode: Node): Node | null {
    // Simple implementation - in practice, you might want a more sophisticated matching
    const walker = document.createTreeWalker(
      clonedRoot,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      null
    )

    let node = walker.nextNode()
    while (node) {
      if (node.nodeType === originalNode.nodeType && 
          node.nodeName === originalNode.nodeName &&
          node.textContent === originalNode.textContent) {
        return node
      }
      node = walker.nextNode()
    }

    return null
  }
}

export default ViewAPI
