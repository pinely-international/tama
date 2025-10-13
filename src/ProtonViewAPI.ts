import { State } from "@denshya/reactive"

import { AsyncGeneratorPrototype } from "./BuiltinObjects"
import { Life } from "./Life"

interface TemplateInfo {
  template: Node
  dynamicZones: Map<string, Node[]>
  eventBindings: Map<Node, Map<string, EventListenerOrEventListenerObject[]>>
  isStale: boolean
}

class ViewAPI extends State<unknown> {
  readonly life = new Life

  declare default: unknown
  private templateCache: TemplateInfo | null = null
  private templateEnabled = true

  constructor() {
    super(null)
  }

  async setIterable(iterable: Iterator<unknown> | AsyncIterator<unknown>) {
    let yieldResult: IteratorResult<unknown> = { done: false, value: undefined }
    while (yieldResult.done === false) {
      yieldResult = await iterable.next()
      this.set(yieldResult.value)
    }
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
    this.set(this.default)
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
