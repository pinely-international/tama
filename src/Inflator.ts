import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "./Accessor"
import ActBindings from "./ActBinding"
import Events from "./Events"
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

  protected pack() { }

  protected abstract inflatePrimitive(primitive: Primitive): unknown
  protected abstract inflateFragment(): unknown

  protected declare parentShell: Proton.Shell
  protected declare catchCallback: (thrown: unknown) => void
  protected declare suspenseCallback: (promise: Promise<void>) => void
  protected declare unsuspenseCallback: (promise: Promise<void>) => void

  private suspenses: Promise<unknown>[] = []

  protected inflateComponent(constructor: <T extends Proton.Shell>(this: T, props: {}) => T, props: {}) {
    const shell = new Proton.Shell(this, this.parentShell)

    const asyncTry = async () => {
      try {
        await constructor.call(shell, props)
      } catch (thrown) {
        if (this.suspenseCallback != null && thrown instanceof Promise) {
          if (this.suspenses.length === 0) this.suspenseCallback(thrown)
          if (!this.suspenses.includes(thrown)) this.suspenses.push(thrown)

          const length = this.suspenses.length


          await Promise.all(this.suspenses)
          await constructor.call(shell, props)


          if (length === this.suspenses.length) {
            this.unsuspenseCallback?.(thrown)
            this.suspenses = []
          }

          return
        }
        if (this.catchCallback != null) return void this.catchCallback(thrown)

        throw thrown
      }
    }

    asyncTry()

    return shell
  }
}

export class WebInflator extends Inflator {
  // private components = new Set

  public inflate<T>(subject: T): T extends Node ? T : (T extends ProtonJSX.Node ? (HTMLElement | Comment) : (T extends Exclude<Primitive, null | undefined> ? Node : T)) {
    if (subject instanceof Node) return subject as never
    if (subject instanceof ProtonJSX.Node) return this.inflateJSXDeeply(subject) as never

    if (subject instanceof Events.Index) return this.inflateIndexed(subject) as never
    if (subject instanceof Object && (subject.get != null || subject[Symbol.subscribe] != null)) return this.inflateObservable(subject) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Node {
    return document.createTextNode(String(primitive))
  }

  protected inflateFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  protected inflateJSX(value: ProtonJSX.Node | Primitive): HTMLElement | DocumentFragment | Node {
    // if (value instanceof Proton.Shell) return evaluateComponentShell(value)
    if (value instanceof ProtonJSX.Intrinsic) return this.inflateJSXIntrinsic(value)
    if (value instanceof ProtonJSX.Component) return this.inflateJSXComponent(value)
    if (value instanceof ProtonJSX._Fragment) return this.inflateFragment()

    throw new TypeError("Unsupported type of `jsx`", { cause: { jsx: value } })
  }

  protected inflateObservable(child: unknown) {
    const get = child.get instanceof Function ? () => child.get() : null
    const subscribe = child[Symbol.subscribe] instanceof Function ? next => child[Symbol.subscribe](next) : null

    const textNode = document.createTextNode(get?.() ?? "")

    subscribe?.(value => textNode.textContent = get ? get() : value)

    return textNode
  }

  protected inflateIndexed(index: Events.Index<unknown>) {
    const comment = document.createComment(index.constructor.name)
    const inflateItem = (item: unknown) => item !== Null.OBJECT ? this.inflate(item) : item

    let inflatedItems = index.array.map((item: unknown, index: number) => {
      const inflated = item !== Null.OBJECT ? this.inflate(item) : item
      if (inflated instanceof Comment) {
        inflated.onReplace(view => inflatedItems[index] = view)
      }

      return inflated
    })

    requestAnimationFrame(() => {
      // Probably, something went wrong and the Element was not added or removed finally.
      if (comment.parentElement == null) return

      comment.before(...inflatedItems.filter(item => item !== Null.OBJECT))
    })

    index.on("push").subscribe?.(newItems => {
      const newInflatedItems = newItems.map(inflateItem)

      inflatedItems.push(...newInflatedItems)
      comment.before(...newInflatedItems)
    })
    index.on("null").subscribe?.(i => {
      inflatedItems[i].remove()
      inflatedItems[i] = Null.OBJECT
    })
    index.on("replace").subscribe?.(newItems => {
      inflatedItems.forEach(item => item !== Null.OBJECT && item.remove())

      const newInflatedItems = newItems.map(inflateItem)

      inflatedItems = newInflatedItems
      comment.before(...newInflatedItems)
    })

    return comment
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
    if (node instanceof ProtonJSX.Component) return object as never


    const appendChildObject = (child: ProtonJSX.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (childInflated == null) return

      object.appendChild(childInflated)
    }

    node.children?.forEach(appendChildObject)
    node.childrenExtrinsic?.forEach(appendChildObject)

    return object
  }

  protected asd(type: string) {
    switch (type) {
      case "svg":
      case "use":
        return document.createElementNS("http://www.w3.org/2000/svg", type)

      default:
        return document.createElement(type)
    }
  }

  protected inflateJSXIntrinsic(intrinsic: ProtonJSX.Intrinsic): HTMLElement | DocumentFragment | Comment {
    if (typeof intrinsic.type !== "string") {
      throw new TypeError(typeof intrinsic.type + " type of intrinsic element is not supported", { cause: { type: intrinsic.type } })
    }

    const intrinsicInflated = this.asd(intrinsic.type)
    if (intrinsic.props == null) return intrinsicInflated

    if ("style" in intrinsic.props) this.bindStyle(intrinsic.props.style, intrinsicInflated)

    if (intrinsicInflated instanceof SVGElement) {
      if (intrinsic.props.class != null) {
        this.bindPropertyCallback(intrinsic.props.class, value => intrinsicInflated.setAttribute("class", value))
      }
    }

    if (intrinsic.type === "use") {
      const svgUse = intrinsicInflated as SVGUseElement
      if (typeof intrinsic.props.href === "string") svgUse.href.baseVal = intrinsic.props.href
      if (typeof intrinsic.props.href === "object") {
        const accessor = Accessor.extractObservable(intrinsic.props.href)
        if (accessor != null) {
          svgUse.href.baseVal = accessor.get?.() ?? ""
          accessor.subscribe?.(value => svgUse.href.baseVal = accessor.get?.() ?? value)
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

      const accessor = Accessor.extractObservable(property)
      if (accessor == null) continue

      guardAccessors.push(accessor as never)
      accessor.subscribe?.(value => {
        value = accessor.get?.() ?? value
        guards.set(accessor, property.valid(value))

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

  protected bindProperty(key: string, source: unknown, target: Element): void {
    this.bindPropertyCallback(source, value => target[key] = value)
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
    if (view == null) return comment
    if (view instanceof DocumentFragment) return comment
    if (view instanceof Node) {
      if ("replaceWith" in view) return view

      return comment
    }

    return comment
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    const shell = this.inflateComponent(component.type as never, component.props)
    const view = shell.getView()

    const comment = document.createComment(component.type.name)
    comment.onReplace = shell.on("view").subscribe


    let oldView: Node = this.getInitialView(view, comment)
    let oldViewChildren: Node[] = Null.ARRAY

    if (view instanceof DocumentFragment) {
      oldViewChildren = [...view.childNodes]
    }


    console.debug(this.constructor.name, { view, anchor: oldView, anchorChildren: oldViewChildren })

    let lastAnimationFrame = -1

    shell.on("view").subscribe(view => {
      // Assume that the anchor node was already connected.
      const schedule = () => {
        console.debug(this.constructor.name, { view, anchor: oldView, anchorChildren: oldViewChildren })

        if (view === null) view = comment
        if (view instanceof Node === false) return

        if ("replaceWith" in oldView) {
          oldView.replaceWith(view)
          oldView = view

          return
        }

        const anchorFirstChild = oldViewChildren.shift()
        if (anchorFirstChild == null) return

        const anchorFirstChildParent = anchorFirstChild instanceof Node && anchorFirstChild.parentElement
        if (!anchorFirstChildParent) return

        oldViewChildren.forEach(rest => anchorFirstChildParent.removeChild(rest as never))

        oldView = view
        oldViewChildren = [...view.childNodes]

        anchorFirstChildParent.replaceChild(view, anchorFirstChild)
      }

      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(schedule)
    })

    return oldView as never
  }
}


const HTMLInputNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!
const HTMLInputNativeSet = HTMLInputNativeValue.set!
const HTMLInputNativeGet = HTMLInputNativeValue.get!

// class HTMLElementComponent extends HTMLElement {
//   constructor() {
//     super()

//     this.attachShadow({ mode: "open", delegatesFocus: true }).getRootNode()
//   }
// }

// window.customElements.define("Component", HTMLElementComponent)
