import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "./Accessor"
import { isRecord } from "./helpers"
import Null from "./Null"
import { Subscriptable } from "./Observable"
import Proton from "./Proton"
import ProtonJSX from "./ProtonJSX"
import WebNodeBinding from "./WebElementBinding"



export abstract class Inflator {
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

  protected abstract inflatePrimitive(primitive: Primitive): unknown
  protected abstract inflateFragment(): unknown

  protected declare parentShell: Proton.Shell
  protected declare catchCallback?: (thrown: unknown) => void
  protected declare suspenseCallback?: (promise: Promise<unknown>) => void
  protected declare unsuspenseCallback?: (promise: Promise<unknown>) => void

  private suspenses: Promise<unknown>[] = []

  protected inflateComponent(constructor: <T extends Proton.Shell>(this: T, props?: {}) => T, props?: {}) {
    const shell = new Proton.Shell(this, this.parentShell)

    const asyncTry = async () => {
      constructor = constructor instanceof Promise ? await constructor : constructor
      constructor = constructor.default instanceof Function ? constructor.default : constructor

      try {
        shell.view.default = await Promise.resolve(constructor.call(shell, props))
      } catch (thrown) {
        if (this.suspenseCallback != null && thrown instanceof Promise) {
          if (this.suspenses.length === 0) this.suspenseCallback(thrown)
          if (!this.suspenses.includes(thrown)) this.suspenses.push(thrown)

          const length = this.suspenses.length


          await Promise.all(this.suspenses)
          shell.view.default = await constructor.call(shell, props)


          if (length === this.suspenses.length) {
            this.unsuspenseCallback?.(thrown)
            this.suspenses = []
          }

          return
        }
        if (this.catchCallback != null) return void this.catchCallback(thrown)

        throw thrown
      } finally {
        if (shell.view.default == null) return

        shell.view.set(shell.view.default)

        requestAnimationFrame(() => {
          shell.events.dispatch("mount", shell.getView())
        })
      }
    }

    asyncTry()

    return shell
  }
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
    if (shellView instanceof Node === false) return null
    if (shellView.parentElement == null) return this

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

export class WebInflator extends Inflator {
  public inflate<T>(subject: T): T extends Node ? T : (T extends JSX.Element ? (Element | Comment) : unknown) {
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
    let inflatedIndexedItems: unknown[] = indexObject.array.map(inflateItem)
    const disconnectInflated = (item: unknown) => {
      const node = WebComponentPlaceholder.actualOf(item)
      if (node instanceof DocumentFragment) {
        node.fixedNodes.forEach(disconnectInflated)
        return
      }

      node?.parentNode?.removeChild(node)
    }

    fragment.indexed = inflatedIndexedItems
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
      fragment.indexed = inflatedIndexedItems

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

    if ("style" in intrinsic.props) this.bindStyle(intrinsic.props.style, inflated)

    if (inflated instanceof SVGElement) {
      if (intrinsic.props.class != null) {
        this.bindPropertyCallback(intrinsic.props.class, value => inflated.setAttribute("class", String(value)))
      }
    }

    if (inflated instanceof SVGUseElement) {
      const svgUse = inflated as SVGUseElement
      if (typeof intrinsic.props.href === "string") svgUse.href.baseVal = intrinsic.props.href
      if (typeof intrinsic.props.href === "object") {
        const accessor = Accessor.extractObservable(intrinsic.props.href)
        if (accessor != null) {
          svgUse.href.baseVal = String(accessor.get?.() ?? "")
          accessor.subscribe?.(value => svgUse.href.baseVal = String(accessor.get?.() ?? value))
        } else {
          svgUse.href.baseVal = intrinsic.props.href.baseVal
        }
      }
    }
    if (inflated instanceof HTMLInputElement || inflated instanceof HTMLTextAreaElement) {
      WebNodeBinding.dualSignalBind(inflated, "value", intrinsic.props.value, "input")
    }

    if (isRecord(intrinsic.props.on)) {
      if (this.catchCallback == null)
        for (const key in intrinsic.props.on) {
          inflated.addEventListener(key, intrinsic.props.on[key])
        }
      if (this.catchCallback != null)
        for (const key in intrinsic.props.on) {
          inflated.addEventListener(key, event => {
            try {
              intrinsic.props.on[key].call(event.currentTarget, event)
            } catch (thrown) {
              if (this.catchCallback != null) return void this.catchCallback(thrown)

              throw thrown
            }
          })
        }
    }

    const properties = Object.entries(intrinsic.props)

    for (const [key, value] of properties) {
      if (key === "style") continue
      if (key === "on") continue
      if (key === "mounted") continue
      if (key === "children") continue

      if (intrinsic.type === "input") {
        if (key === "value") continue
      }

      if (intrinsic.type === "use") {
        if (key === "href") continue
      }

      if (inflated instanceof SVGElement) {
        if (key === "class") continue
      }

      this.bindProperty(key, value, inflated)
    }


    // Guard Rendering.
    const mountPlaceholder = new WebMountPlaceholder(inflated, intrinsic.type.toString())

    const guards = new Map<object, boolean>()
    const guardAccessors: (AccessorGet<unknown> & Subscriptable<unknown>)[] = []

    for (const [, property] of properties) {
      if (property instanceof Object === false) continue
      if ("valid" in property === false) continue
      if (property.valid instanceof Function === false) continue

      const accessor = Accessor.extractObservable(property)
      if (accessor == null) continue

      guardAccessors.push(accessor as never)
      accessor.subscribe?.(value => {
        // @ts-expect-error should be fine actually.
        guards.set(accessor, property.valid(value))
        value = accessor.get?.() ?? value

        if (guards.values().every(Boolean)) {
          if (!mountPlaceholder.isConnected) return
          mountPlaceholder.replaceWith(inflated)
        } else {
          if (!inflated.isConnected) return
          inflated.replaceWith(mountPlaceholder)
        }
      })

      const value = accessor.get?.()
      if (property.valid(value) === false) return mountPlaceholder
    }

    // `Mounted` property.
    if (intrinsic.props.mounted) {
      const accessor = Accessor.extractObservable(intrinsic.props.mounted)
      if (accessor == null) return inflated

      guardAccessors.push(accessor as never)

      accessor.subscribe?.(mounted => {
        mounted = accessor.get?.() ?? mounted

        if (mounted) {
          if (!mountPlaceholder.isConnected) return
          mountPlaceholder.replaceWith(inflated)
        } else {
          if (!inflated.isConnected) return
          inflated.replaceWith(mountPlaceholder)
        }
      })

      if (accessor?.get == null) return inflated
      if (!accessor.get()) return mountPlaceholder
    }



    return inflated
  }

  protected bindProperty(key: keyof never, source: unknown, target: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bindPropertyCallback(source, value => (target as any)[key] = value)
  }

  protected bindPropertyCallback(source: unknown, targetBindCallback: (value: unknown) => void): void {
    if (typeof source === "string") {
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
    const shell = this.inflateComponent(component.type as never, component.props)
    const componentPlaceholder = new WebComponentPlaceholder(shell, component.type)

    let currentView: Node = componentPlaceholder
    let lastAnimationFrame = -1

    const schedule = (nextView: Node) => {

      if ("replaceWith" in currentView && currentView.replaceWith instanceof Function) {
        currentView.replaceWith(nextView)
        currentView = nextView
        currentView.shell = shell

        return
      }

      if (currentView instanceof DocumentFragment) {
        const fixedNodes = currentView.fixedNodes.map(WebComponentPlaceholder.actualOf)
        const anchor = fixedNodes[0]

        anchor.parentElement.replaceChild(nextView, anchor)
        currentView.replaceChildren(...fixedNodes)

        currentView = nextView
        currentView.shell = shell

        if (anchor instanceof WebComponentPlaceholder) {
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

    return componentPlaceholder
  }
}
