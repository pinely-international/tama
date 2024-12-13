import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "./Accessor"
import ActBindings from "./ActBinding"
import Null from "./Null"
import { Subscriptable } from "./Observable"
import Proton from "./Proton"
import ProtonJSX from "./ProtonJSX"



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
  protected declare catchCallback: (thrown: unknown) => void
  protected declare suspenseCallback: (promise: Promise<void>) => void
  protected declare unsuspenseCallback: (promise: Promise<void>) => void

  private suspenses: Promise<unknown>[] = []

  protected inflateComponent(constructor: <T extends Proton.Shell>(this: T, props?: {}) => T, props?: {}) {
    const shell = new Proton.Shell(this, this.parentShell)

    const asyncTry = async () => {
      try {
        shell.view.default = await constructor.call(shell, props)
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
        shell.view.default && shell.view.set(shell.view.default)
      }
    }

    asyncTry()

    return shell
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
    if (item instanceof Node) item

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

    return shellView
  }

  constructor(public shell: Proton.Shell, shellConstructor: Function) {
    super(shellConstructor.name)
  }

  override get parentElement() {
    const element = super.parentElement ?? this.actual?.parentElement
    if (element == null) {
      const shellView = this.shell.getView()
      if (shellView instanceof Node === false) return null

      return shellView.parentElement
    }

    return element
  }
}

const tempFragment = document.createDocumentFragment()

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

  protected inflateIndexed(indexObject: Proton.Index) {
    const comment = document.createComment(indexObject.constructor.name)
    const inflateItem = (item: unknown) => item !== indexObject.EMPTY ? this.inflate(item) : item

    let inflatedIndexedItems: unknown[] = indexObject.array.map(item => {
      if (item === indexObject.EMPTY) return item

      return this.inflate(item)
    })

    tempFragment.replaceChildren(...inflatedIndexedItems.filter(isNode))
    tempFragment.append(comment)

    indexObject.on("push").subscribe(newItems => {
      const newInflatedItems = newItems.map(inflateItem)
      inflatedIndexedItems.push(...newInflatedItems)

      tempFragment.replaceChildren(...newInflatedItems.filter(isNode))
      comment.before(tempFragment)
    })
    indexObject.on("null").subscribe(i => {
      const item = inflatedIndexedItems[i]
      inflatedIndexedItems[i] = indexObject.EMPTY

      const node = WebComponentPlaceholder.actualOf(item)
      node?.parentNode?.removeChild(node)
    })
    indexObject.on("replace").subscribe(newItems => {
      inflatedIndexedItems.forEach(item => {
        const node = WebComponentPlaceholder.actualOf(item)
        node?.parentNode?.removeChild(node)
      })

      const newInflatedItems = newItems.map(inflateItem)
      inflatedIndexedItems = newInflatedItems

      tempFragment.replaceChildren(...newInflatedItems.filter(isNode))
      comment.before(tempFragment)
    })

    return tempFragment
  }

  protected bindStyle(style: unknown, element: ElementCSSInlineStyle) {
    if (style == null) return
    if (typeof style === "string") {
      element.style.cssText = style
    }

    const styleAccessor = Accessor.extractObservable<string>(style)
    if (styleAccessor != null) {
      element.style.cssText = styleAccessor.get?.() ?? ""
      styleAccessor.subscribe?.(value => element.style.cssText = styleAccessor.get?.() ?? value)

      return
    }

    const reactions = new ActBindings(element.style)

    for (const _property in style) {
      const property = _property as keyof typeof style

      const value = style[property]
      if (value[Symbol.subscribe] != null) {
        reactions.set(style, property)

        continue
      }

      element.style[property] = value
    }
  }

  private inflateJSXDeeply(node: ProtonJSX.Node): HTMLElement | DocumentFragment | Node {
    const object = this.inflateJSX(node)
    if (node instanceof ProtonJSX.Component) return object


    const appendChildObject = (child: ProtonJSX.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (!isNode(childInflated)) return

      object.appendChild(childInflated)
    }

    node.children?.forEach(appendChildObject)
    node.childrenExtrinsic?.forEach(appendChildObject)

    return object
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

    const intrinsicInflated = this.inflateDocumentElement(intrinsic.type)
    if (intrinsic.props == null) return intrinsicInflated

    if ("style" in intrinsic.props) this.bindStyle(intrinsic.props.style, intrinsicInflated)

    if (intrinsicInflated instanceof SVGElement) {
      if (intrinsic.props.class != null) {
        this.bindPropertyCallback(intrinsic.props.class, value => intrinsicInflated.setAttribute("class", String(value)))
      }
    }

    if (intrinsic.type === "use") {
      const svgUse = intrinsicInflated as SVGUseElement
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
    if (intrinsic.type === "input") {
      const accessor = Accessor.extractObservable(intrinsic.props.value)
      if (accessor != null) {
        if (accessor.get) HTMLInputNativeSet.call(intrinsicInflated, accessor.get())
        if (accessor.set) {
          Object.defineProperty(intrinsicInflated, "value", {
            get: () => HTMLInputNativeGet.call(intrinsicInflated),
            set: value => {
              HTMLInputNativeSet.call(intrinsicInflated, value)
              accessor.set!(value)
            }
          })

          intrinsicInflated.addEventListener("input", event => accessor.set!((event.currentTarget as HTMLInputElement).value))
        }
        accessor.subscribe?.(value => HTMLInputNativeSet.call(intrinsicInflated, accessor.get?.() ?? value))
      }
    }

    if (intrinsic.props.on instanceof Object) {
      if (this.catchCallback == null)
        for (const key in intrinsic.props.on) {
          intrinsicInflated.addEventListener(key, intrinsic.props.on[key])
        }
      if (this.catchCallback != null)
        for (const key in intrinsic.props.on) {
          intrinsicInflated.addEventListener(key, event => {
            if (intrinsic.props?.on?.[key as never] == null) return

            try {
              intrinsic.props.on[key as never].call(event.currentTarget, event)
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

      if (intrinsic.type === "input") {
        if (key === "value") continue
      }

      if (intrinsic.type === "use") {
        if (key === "href") continue
      }

      if (intrinsicInflated instanceof SVGElement) {
        if (key === "class") continue
      }

      this.bindProperty(key, value, intrinsicInflated)
    }


    // Guard Rendering.
    const comment = document.createComment(intrinsic.type.toString())

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
          if (!comment.isConnected) return
          comment.replaceWith(intrinsicInflated)
        } else {
          if (!intrinsicInflated.isConnected) return
          intrinsicInflated.replaceWith(comment)
        }
      })

      const value = accessor.get?.()
      if (property.valid(value) === false) return comment
    }

    // `Mounted` property.
    if (intrinsic.props.mounted) {
      const accessor = Accessor.extractObservable(intrinsic.props.mounted)
      if (accessor == null) return intrinsicInflated

      guardAccessors.push(accessor as never)

      accessor.subscribe?.(mounted => {
        mounted = accessor.get?.() ?? mounted

        if (mounted) {
          if (!comment.isConnected) return
          comment.replaceWith(intrinsicInflated)
        } else {
          if (!intrinsicInflated.isConnected) return
          intrinsicInflated.replaceWith(comment)
        }
      })

      if (accessor?.get == null) return intrinsicInflated
      if (!accessor.get()) return comment
    }



    return intrinsicInflated
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

  private getInitialView(view: unknown, comment: Comment): Node {
    if (view instanceof DocumentFragment) return view
    if (view instanceof Node && "replaceWith" in view) return view

    return comment
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    const shell = this.inflateComponent(component.type as never, component.props)
    const view = shell.getView()

    const componentPlaceholder = new WebComponentPlaceholder(shell, component.type)


    let currentView: Node = this.getInitialView(view, componentPlaceholder)
    let currentViewChildren: Node[] = Null.ARRAY

    if (view instanceof DocumentFragment) {
      currentViewChildren = [...view.childNodes]
    }


    let lastAnimationFrame = -1

    shell.on("view").subscribe(view => {
      if (view === null) view = componentPlaceholder
      if (view instanceof Node === false) return
      if (view === currentView) return

      const schedule = () => {
        if ("replaceWith" in currentView && currentView.replaceWith instanceof Function) {
          if (view instanceof DocumentFragment) {
            currentViewChildren = [...view.childNodes]
          }

          currentView.replaceWith(view)
          currentView = view

          return
        }

        if (currentView instanceof DocumentFragment) {
          const anchorFirstChild = currentViewChildren[0]
          if (anchorFirstChild == null) throw new Error("Can't replace live element of fragment")

          const anchorFirstChildParent = anchorFirstChild instanceof Node && anchorFirstChild.parentElement
          if (!anchorFirstChildParent) throw new Error("Can't replace live element of fragment")

          const oldView = currentView
          const oldViewChildren = currentViewChildren.map(node => WebComponentPlaceholder.actualOf(node) ?? node)

          currentView = view
          currentViewChildren = [...view.childNodes]

          // `anchorFirstChild` is meant to throw error if `null`.
          anchorFirstChildParent.replaceChild(view, WebComponentPlaceholder.actualOf(anchorFirstChild)!)
          oldView.replaceChildren(...oldViewChildren)

          return
        }

        throw new Error("Couldn't update view")
      }

      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(schedule)
    })

    return currentView
  }
}


const HTMLInputNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!
const HTMLInputNativeSet = HTMLInputNativeValue.set!
const HTMLInputNativeGet = HTMLInputNativeValue.get!
