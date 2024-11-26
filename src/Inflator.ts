import { Primitive } from "type-fest"

import ActBindings from "./ActBinding"
import Events from "./Events"
import Null from "./Null"
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

  protected inflateComponent(constructor: <T extends Proton.Shell>(this: T, props: {}) => T, props: {}) {
    const shell = new Proton.Shell(this)

    constructor.call(shell, props)
    // if (component !== shell) throw new TypeError("Proton Component must return `this`.")

    return shell
  }
}

export class WebInflator extends Inflator {
  protected jsxIntrinsicEvaluator = new ProtonJSX.HTMLIntrinsicEvaluator(
    function transformIntrinsic(input) { return input },
    function transformElement(element) { return element }
  )

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
    const inflateItem = (item: unknown) => item !== Null.OBJECT ? this.inflate(item) : []

    let inflatedItems = index.array.flatMap(inflateItem)

    requestAnimationFrame(() => {
      // Probably, something went wrong and the Element was not added or removed finally.
      if (comment.parentElement == null) return

      comment.before(...inflatedItems)
    })

    index.on("push").subscribe?.(newItems => {
      const newInflatedItems = newItems.flatMap(inflateItem)

      inflatedItems.push(...newInflatedItems)
      comment.before(...newInflatedItems)
    })
    index.on("null").subscribe?.(i => {
      console.log("null", i, inflatedItems)

      // if (inflatedItems[i] === Null.OBJECT) return

      inflatedItems[i].remove()
      inflatedItems[i] = Null.OBJECT
    })
    index.on("replace").subscribe?.(newItems => {
      inflatedItems.forEach(item => item !== Null.OBJECT && item.remove())
      inflatedItems = []

      const newInflatedItems = newItems.flatMap(inflateItem)

      inflatedItems.push(...newInflatedItems)
      comment.before(...newInflatedItems)
    })

    return comment
  }

  private inflateJSXDeeply(value: ProtonJSX.Node | Primitive): HTMLElement | DocumentFragment | Node {
    const object = this.inflateJSX(value)
    if (value instanceof ProtonJSX.Node === false) return object as never


    const appendChildObject = (child: ProtonJSX.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (childInflated == null) return

      object.appendChild(childInflated)
    }

    value.children?.forEach(appendChildObject)
    value.childrenExtrinsic?.forEach(appendChildObject)

    return object
  }

  protected inflateJSXIntrinsic(intrinsic: ProtonJSX.Intrinsic): HTMLElement | DocumentFragment {
    const intrinsicInflated = this.jsxIntrinsicEvaluator.evaluate(intrinsic as never)

    if (intrinsic.props == null) return intrinsicInflated

    if ("style" in intrinsic.props) {
      const reactions = new ActBindings(intrinsicInflated.style)

      for (const property in intrinsic.props.style) {
        const value = intrinsic.props.style[property]
        if (value[Symbol.subscribe] != null) {
          reactions.set(intrinsic.props.style, property)

          continue
        }

        intrinsicInflated.style[property] = value
      }
    }

    if (intrinsic.props.className)
      intrinsicInflated.className = intrinsic.props.className


    if (intrinsic.type === "input") {
      if (intrinsic.props.value instanceof Object) {
        const get = intrinsic.props.value.get instanceof Function ? () => intrinsic.props.value.get() : null
        const set = intrinsic.props.value.set instanceof Function ? v => intrinsic.props.value.set(v) : null
        const subscribe = intrinsic.props.value[Symbol.subscribe] instanceof Function ? next => intrinsic.props.value[Symbol.subscribe](next) : null


        if (get) HTMLInputNativeSet.call(intrinsicInflated, get())
        if (set) {
          Object.defineProperty(intrinsicInflated, "value", {
            get: () => HTMLInputNativeGet.call(intrinsicInflated),
            set: value => {
              HTMLInputNativeSet.call(intrinsicInflated, value)
              set(value)
            }
          })

          intrinsicInflated.addEventListener("change", event => set(event.currentTarget.value))
        }
        if (subscribe) subscribe(value => HTMLInputNativeSet.call(intrinsicInflated, get ? get() : value))
      }
    }

    if (intrinsic.type === "button") {
      if (intrinsic.props.type != null) intrinsicInflated.type = intrinsic.props.type
      if (intrinsic.props.on instanceof Object) {
        for (const key in intrinsic.props.on) {
          intrinsicInflated.addEventListener(key, intrinsic.props.on[key])
        }
      }
    }

    return intrinsicInflated
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    const shell = this.inflateComponent(component.type as never, component.props)
    const view = shell.getView()

    let anchor: Node
    let anchorChildren: Node[] = Null.ARRAY

    if (view instanceof DocumentFragment) {
      anchor = view
      anchorChildren = [...view.childNodes]
    } else if (view instanceof Node) {
      anchor = view
    } else {
      const comment = document.createComment(this.constructor.name)
      anchor = comment
    }

    let lastAnimationFrame = -1

    // shell.on("detach").subscribe?.(() => )
    shell.onViewChange(view => {
      if (view instanceof Node === false) return

      // Assume that the anchor node was already connected.
      const schedule = () => {
        if (anchor instanceof Node === false) return

        const anchorFirstChild = anchorChildren.shift()
        if (anchorFirstChild == null) {
          anchor.replaceWith(view)
          anchor = view

          return
        }

        const anchorFirstChildParent = anchorFirstChild instanceof Node && anchorFirstChild.parentElement
        if (!anchorFirstChildParent) return

        anchorChildren.forEach(rest => anchorFirstChildParent.removeChild(rest as never))

        anchor = view
        anchorChildren = [...view.childNodes]

        anchorFirstChildParent.replaceChild(view, anchorFirstChild)
      }

      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(schedule)
    })

    return anchor as never
  }
}


const HTMLInputNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!
const HTMLInputNativeSet = HTMLInputNativeValue.set!
const HTMLInputNativeGet = HTMLInputNativeValue.get!
