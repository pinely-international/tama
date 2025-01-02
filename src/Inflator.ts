import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "./Accessor"
import { isRecord } from "./helpers"
import Observable, { Subscriptable } from "./Observable"
import Proton from "./Proton"
import ProtonJSX from "./ProtonJSX"
import WebNodeBinding from "./WebElementBinding"



export abstract class Inflator {
  static clone(inflator: Inflator, shell: Proton.Shell): Inflator {
    return inflator.clone(shell)
  }

  public inflate(subject: unknown): unknown {
    if (subject == null) return subject

    switch (typeof subject) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "symbol":
        return this.inflatePrimitive(subject)

      default:
        return this.inflatePrimitive(String(subject))
    }
  }

  protected abstract clone(shell: Proton.Shell): Inflator

  protected abstract inflatePrimitive(primitive: Primitive): unknown
  // protected abstract inflateFragment(): unknown

  protected declare shell: Proton.Shell
}

class WebMountPlaceholder extends Comment {
  constructor(private element: Node, name: string) { super(name) }

  override appendChild<T extends Node>(node: T): T {
    return this.element.appendChild(node)
  }
}

class WebComponentPlaceholder extends Comment {
  /**
   * @returns actual node of `WebComponentPlaceholder` if `item` is of its instance.
   * @returns `item` itself if `item` is instance of `Node`.
   * @returns null if `item` is NOT instance of `Node`.
   */
  static actualOf(item: unknown): WebComponentPlaceholder | Node | null {
    if (item instanceof WebComponentPlaceholder) return item.actual
    if (item instanceof Node) return item

    return null
  }

  /**
   * The node that is supposed to be being used at current conditions.
   */
  get actual(): Node | null {
    const shellView = this.shell.getView()

    if (shellView == null) return this
    if (shellView === this) return this
    if (shellView instanceof Node === false) return null

    return WebComponentPlaceholder.actualOf(shellView)
  }

  constructor(public shell: Proton.Shell, shellConstructor: Function) {
    super(shellConstructor.name)
  }

  protected safeActualParentElement() {
    const actual = this.actual
    if (actual === this) return null

    return this.actual?.parentElement
  }

  override get parentElement() {
    const element = super.parentElement ?? this.safeActualParentElement()
    if (element == null) {
      const shellView = this.shell.getView()
      if (shellView === this) return null
      if (shellView instanceof Node === false) return null

      return shellView.parentElement
    }

    return element
  }
}

const isNode = (value: unknown): value is Node => {
  if (value instanceof Node) return true

  return false
}


type InflateResult<T> =
  T extends Node ? T :
  T extends JSX.Element ? (Element | WebComponentPlaceholder) :
  T extends Observable<unknown> ? Text :
  T extends Primitive ? Text :
  Text

export class WebInflator extends Inflator {
  protected clone(shell: Proton.Shell): Inflator {
    const inflator = new WebInflator
    inflator.shell = shell

    return inflator
  }

  public inflate<T>(subject: T): InflateResult<T> {
    if (subject instanceof Node) return subject as never
    if (subject instanceof ProtonJSX.Node) return this.inflateJSXDeeply(subject) as never
    if (subject instanceof Object && subject[Proton.Symbol.index as keyof object] != null) return this.inflateIndexed(subject as never) as never

    const accessor = Accessor.extractObservable(subject)
    if (accessor != null) return this.inflateAccessor(accessor) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Node {
    return document.createTextNode(String(primitive))
  }

  protected inflateFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  protected inflateJSX(value: ProtonJSX.Node): HTMLElement | DocumentFragment | Node {
    if (value instanceof ProtonJSX.Intrinsic) return this.inflateJSXIntrinsic(value)
    if (value instanceof ProtonJSX.Component) return this.inflateJSXComponent(value)
    if (value instanceof ProtonJSX._Fragment) return this.inflateFragment()

    throw new TypeError("Unsupported type of `jsx`", { cause: { jsx: value } })
  }

  protected inflateAccessor<T>(accessor: Partial<Accessor<T> & Subscriptable<T>>) {
    const textNode = document.createTextNode(String(accessor.get?.()))

    accessor.subscribe?.(value => textNode.textContent = String(accessor.get?.() ?? value))

    return textNode
  }

  protected inflateIndexed<T>(indexObject: Proton.Index<T>) {
    const comment = new Comment(indexObject.constructor.name)
    const fragment = new DocumentFragment

    const inflateItem = (item: unknown) => item !== indexObject.EMPTY ? this.inflate(item) : item
    // @ts-expect-error
    const items = indexObject.array
    let inflatedIndexedItems: unknown[] = items.map(inflateItem)
    const disconnectInflated = (item: unknown) => {
      const node = WebComponentPlaceholder.actualOf(item)
      if (node instanceof DocumentFragment) {
        // @ts-expect-error
        node.fixedNodes.forEach(disconnectInflated)
        return
      }

      node?.parentNode?.removeChild(node)
    }

    fragment.replaceChildren(...inflatedIndexedItems.filter(isNode))
    fragment.append(comment)

    indexObject.on("push").subscribe(newItems => {
      const newInflatedItems = newItems.map(inflateItem)
      inflatedIndexedItems.push(...newInflatedItems)

      fragment.replaceChildren(...newInflatedItems.filter(isNode))
      comment.before(fragment)
    })
    indexObject.on("null").subscribe(i => {
      const item = inflatedIndexedItems[i]
      inflatedIndexedItems[i] = indexObject.EMPTY

      const node = WebComponentPlaceholder.actualOf(item)
      node?.parentNode?.removeChild(node)
    })
    indexObject.on("replace").subscribe(newItems => {
      inflatedIndexedItems.forEach(disconnectInflated)

      const newInflatedItems = newItems.map(inflateItem)
      inflatedIndexedItems = newInflatedItems

      fragment.replaceChildren(...newInflatedItems.filter(isNode))
      comment.before(fragment)
    })

    return fragment
  }

  protected bindStyle(style: unknown, element: ElementCSSInlineStyle) {
    if (isRecord(style)) {
      for (const property in style) {
        this.bindProperty(property, style[property], element.style)
      }

      return
    }

    this.bindPropertyCallback(style, value => element.style.cssText = String(value))
  }

  private inflateJSXDeeply(jsx: ProtonJSX.Node): HTMLElement | DocumentFragment | Node {
    const node = this.inflateJSX(jsx)
    if (jsx instanceof ProtonJSX.Component) return node


    const appendChildObject = (child: ProtonJSX.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (!isNode(childInflated)) return

      try {
        node.appendChild(childInflated)
      } catch (error) {
        console.debug("appendChildObject -> ", child, childInflated)
        console.trace(error)
        throw error
      }
    }

    jsx.children?.forEach(appendChildObject)
    jsx.childrenExtrinsic?.forEach(appendChildObject)

    if (node instanceof DocumentFragment) {
      // @ts-expect-error
      node.fixedNodes = [...node.childNodes]
    }

    return node
  }

  protected inflateDocumentElement(type: string) {
    switch (type) {
      case "svg":
      case "use":
        return document.createElementNS("http://www.w3.org/2000/svg", type)

      default:
        return document.createElement(type)
    }
  }

  protected inflateJSXIntrinsic(intrinsic: ProtonJSX.Intrinsic): Element | Comment {
    if (typeof intrinsic.type !== "string") {
      throw new TypeError(typeof intrinsic.type + " type of intrinsic element is not supported", { cause: { type: intrinsic.type } })
    }

    const inflated = this.inflateDocumentElement(intrinsic.type)
    if (intrinsic.props == null) return inflated

    try {
      const properties = Object.entries(intrinsic.props)
      const overridden = this.bindSpecialProperties(intrinsic.props, inflated)

      for (const [key, value] of properties) {
        if (overridden.has(key)) continue

        this.bindProperty(key, value, inflated)
      }

      // Guard Rendering.
      let mountPlaceholder: WebMountPlaceholder | null = null

      function toggleMount(condition: unknown) {
        if (condition) {
          if (!mountPlaceholder!.isConnected) return
          mountPlaceholder!.replaceWith(inflated)
        } else {
          if (!inflated.isConnected) return
          inflated.replaceWith(mountPlaceholder!)
        }
      }

      const guards = new Map<object, boolean>()
      const guardAccessors: (AccessorGet<unknown> & Subscriptable<unknown>)[] = []


      for (const [key, property] of properties) {
        if (property instanceof Object === false) continue

        // @ts-expect-error
        if (key === "mounted") property.valid = () => true

        if ("valid" in property === false) continue
        if (property.valid instanceof Function === false) continue

        const accessor = Accessor.extractObservable(property)
        if (accessor == null) continue

        if (mountPlaceholder == null) {
          mountPlaceholder = new WebMountPlaceholder(inflated, intrinsic.type.toString())
        }

        guardAccessors.push(accessor as never)
        accessor.subscribe?.(value => {
          value = accessor.get?.() ?? value
          // @ts-expect-error should be fine actually.
          guards.set(accessor, property.valid(value))

          toggleMount(guards.values().every(Boolean))
        })

        if (accessor.get && property.valid(accessor.get()) === false) return mountPlaceholder
      }

      // // `Mounted` property.
      // if (intrinsic.props.mounted) {
      //   const accessor = Accessor.extractObservable(intrinsic.props.mounted)
      //   if (accessor == null) return inflated

      //   if (mountPlaceholder == null) {
      //     mountPlaceholder = new WebMountPlaceholder(inflated, intrinsic.type.toString())
      //   }

      //   guardAccessors.push(accessor as never)

      //   accessor.subscribe?.(mounted => {
      //     mounted = accessor.get?.() ?? mounted
      //     toggleMount(mounted)
      //   })

      //   if (accessor?.get == null) return inflated
      //   if (!accessor.get()) return mountPlaceholder!
      // }
    } catch (error) {
      console.error("Element props binding failed -> ", error)
    }

    return inflated
  }

  protected bindEventListeners(listeners: any, element: Element) {
    // @ts-expect-error
    const catchCallback = this.shell.catchCallback

    if (catchCallback == null)
      for (const key in listeners) {
        element.addEventListener(key, listeners[key])
      }
    if (catchCallback != null)
      for (const key in listeners) {
        element.addEventListener(key, event => {
          try {
            listeners[key].call(event.currentTarget, event)
          } catch (thrown) {
            if (catchCallback != null) return void catchCallback(thrown)

            throw thrown
          }
        })
      }
  }

  /** @returns property names that were overridden. */
  protected bindSpecialProperties(properties: any, element: Element): Set<string> {
    const overrides = new Set<string>()

    if (isRecord(properties.on)) {
      this.bindEventListeners(properties.on, element)
      overrides.add("on")
    }

    if (element instanceof HTMLElement && "style" in properties) {
      this.bindStyle(properties.style, element)
      overrides.add("style")
    }

    if (element instanceof SVGElement) {
      if (properties.class != null) {
        this.bindPropertyCallback(properties.class, value => element.setAttribute("class", String(value)))
        overrides.add("class")
      }
    }

    if (element instanceof SVGUseElement) {
      const svgUse = element as SVGUseElement
      this.bindPropertyCallback(properties.href, (href: any) => {
        if (typeof href === "string") svgUse.href.baseVal = href
        if (typeof href === "object") svgUse.href.baseVal = href.baseVal
      })

      overrides.add("href")
    }
    if (element instanceof HTMLInputElement) {
      // Ensures correct type beforehand.
      this.bindProperty("type", properties.type, element)

      WebNodeBinding.dualSignalBind(element, "valueAsDate", properties.valueAsDate, "input")
      WebNodeBinding.dualSignalBind(element, "valueAsNumber", properties.valueAsNumber, "input")

      overrides.add("type").add("valueAsDate").add("valueAsNumber")
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      WebNodeBinding.dualSignalBind(element, "value", properties.value, "input")
      overrides.add("value")
    }
    if (element instanceof HTMLSelectElement) {
      WebNodeBinding.dualSignalBind(element, "value", properties.value, "change")
      overrides.add("value")
    }

    return overrides
  }

  protected bindProperty(key: keyof never, value: unknown, target: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bindPropertyCallback(value, value => (target as any)[key] = value)
  }

  protected bindPropertyCallback(source: unknown, targetBindCallback: (value: unknown) => void): void {
    if (typeof source === "string" || typeof source === "number" || typeof source === "boolean" || typeof source === "bigint") {
      targetBindCallback(source)
      return
    }

    const accessor = Accessor.extractObservable(source)
    if (accessor == null) return
    if (accessor.get == null && accessor.subscribe == null) return

    if (accessor.get) targetBindCallback(accessor.get())
    if (accessor.subscribe) accessor.subscribe(value => targetBindCallback(accessor.get?.() ?? value))
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    const shell = new Proton.Shell(this, this.shell)
    const componentPlaceholder = new WebComponentPlaceholder(shell, component.type)

    let currentView: Node = componentPlaceholder
    let lastAnimationFrame = -1

    const schedule = (nextView: Node) => {
      if ("replaceWith" in currentView && currentView.replaceWith instanceof Function) {
        currentView.replaceWith(nextView)
        currentView = nextView

        return
      }

      if (currentView instanceof DocumentFragment) {
        // @ts-expect-error
        const f = currentView.fixedNodes as Node[]
        const fixedNodes = f.map(node => WebComponentPlaceholder.actualOf(node) ?? node)
        // .map(node => {
        //   if (node.shell) {
        //     return (node.shell.previousView?.isConnected ? node.shell.previousView : node.shell.viewElement)
        //   }
        //   return node
        // })

        const anchor = fixedNodes[0]

        anchor.parentElement!.replaceChild(nextView, anchor) // Should throw if no parent.
        currentView.replaceChildren(...fixedNodes)

        currentView = nextView

        if (anchor instanceof WebComponentPlaceholder) {
          // @ts-expect-error
          anchor.shell.events.dispatch("unmount")
        }

        return
      }

      throw new Error("Couldn't update view")
    }

    shell.on("view").subscribe(view => {
      if (view === null) view = componentPlaceholder
      if (view instanceof Node === false) return

      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => schedule(view))
    })

    // @ts-expect-error
    shell.evaluate(component.type, component.props)

    return componentPlaceholder
  }
}
