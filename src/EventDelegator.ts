type EventListenerMap = Record<string, EventListener>;
type BoundHandler = (ev: Event) => void;

interface Registration {
  listeners: EventListenerMap;
  element: Element;
}

export class EventDelegator {
  private eventDelegations = new WeakMap<Node, Set<Registration>>()
  private eventDelegates = new WeakMap<Node, Set<string>>()
  private delegationHandlers = new WeakMap<Node, Map<string, BoundHandler>>()

  root: Node | null = null

  constructor(parent: Node | null = null) {
    this.root = parent
  }

  /**
   * Register listeners for a particular element. If delegation parent is set,
   * listeners are registered for delegation; otherwise a no-op unsubscribe is returned.
   * Returns an unsubscribe function that removes this registration.
   */
  public delegate(listeners: EventListenerMap, element: Element): () => void {
    if (!this.root) {
      // No delegation parent configured — nothing to do. Return no-op unsubscribe.
      return () => { }
    }

    const parent = this.root

    // Ensure registration set exists and add this registration
    let regSet = this.eventDelegations.get(parent)
    if (!regSet) {
      regSet = new Set<Registration>()
      this.eventDelegations.set(parent, regSet)
    }
    const registration: Registration = { listeners, element }
    regSet.add(registration)

    // Ensure delegated event-type set exists
    let delegated = this.eventDelegates.get(parent)
    if (!delegated) {
      delegated = new Set<string>()
      this.eventDelegates.set(parent, delegated)
    }

    // Ensure handler map exists
    let handlerMap = this.delegationHandlers.get(parent)
    if (!handlerMap) {
      handlerMap = new Map<string, BoundHandler>()
      this.delegationHandlers.set(parent, handlerMap)
    }

    // For each event type in this listeners map, attach a single delegation handler
    // on the parent (if not already present) that will iterate registrations and
    // call only those whose element appears in the composedPath.
    for (const type of Object.keys(listeners)) {
      if (delegated.has(type)) continue

      const bound: BoundHandler = (event: Event) => {
        const path = event.composedPath()
        // Iterate registrations and call the handler only if that registration's element is on the path.
        for (const reg of regSet) {
          if (!path.includes(reg.element)) continue
          reg.listeners[type].call(reg.element, event)
        }
      }

      handlerMap.set(type, bound)
      delegated.add(type)
      parent.addEventListener(type, bound)
    }

    // Return unsubscribe for this registration only
    return () => {
      const set = this.eventDelegations.get(parent)
      if (!set) return
      set.delete(registration)

      if (set.size === 0) {
        // No more registrations: remove all handlers and clear maps
        const hm = this.delegationHandlers.get(parent)
        if (hm) {
          for (const [type, fn] of hm) {
            parent.removeEventListener(type, fn)
          }
          hm.clear()
        }
        this.eventDelegations.delete(parent)
        this.eventDelegates.delete(parent)
        this.delegationHandlers.delete(parent)
      } else {
        // Some registrations still present: prune event types that are no longer used
        const remainingTypes = new Set<string>()
        for (const r of set) {
          for (const k of Object.keys(r.listeners)) remainingTypes.add(k)
        }

        const delegatedSet = this.eventDelegates.get(parent)
        const mapHandlers = this.delegationHandlers.get(parent)
        if (delegatedSet && mapHandlers) {
          for (const eventType of Array.from(delegatedSet)) {
            if (!remainingTypes.has(eventType)) {
              const handlerFn = mapHandlers.get(eventType)
              if (handlerFn) {
                parent.removeEventListener(eventType, handlerFn)
                mapHandlers.delete(eventType)
              }
              delegatedSet.delete(eventType)
            }
          }
        }
      }
    }
  }

  /**
   * Remove all delegation handlers from the current eventDelegationParent.
   */
  public clear(): void {
    if (!this.root) return
    const parent = this.root

    const hm = this.delegationHandlers.get(parent)
    if (hm) {
      for (const [type, fn] of hm) {
        parent.removeEventListener(type, fn)
      }
      hm.clear()
    }
    this.eventDelegations.delete(parent)
    this.eventDelegates.delete(parent)
    this.delegationHandlers.delete(parent)
    this.root = null
  }
}
