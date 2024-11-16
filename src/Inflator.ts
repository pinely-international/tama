import { Primitive } from "type-fest"

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

  protected inflateComponent(constructor: <T extends Proton.Shell>(this: T) => T) {
    const shell = new Proton.Shell(this)

    const component = constructor.call(shell)
    if (component !== shell) throw new TypeError("Proton Component must return `this`.")

    return shell
  }
}

export class WebInflator extends Inflator {
  protected jsxIntrinsicEvaluator = new ProtonJSX.HTMLIntrinsicEvaluator(
    function transformIntrinsic(input) { return input },
    function transformElement(element) { return element }
  )

  public inflate<T>(subject: T): T extends Node ? T : (T extends ProtonJSX.Node ? (HTMLElement | DocumentFragment) : (T extends Exclude<Primitive, null | undefined> ? Node : T)) {
    if (subject instanceof Node) return subject as never
    if (subject instanceof ProtonJSX.Node) return this.inflateJSXDeeply(subject) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Node {
    return document.createTextNode(String(primitive))
  }

  protected inflateFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  protected inflateJSX(value: ProtonJSX.Node | Primitive): HTMLElement | DocumentFragment | Node {
    if (value instanceof ProtonJSX.Intrinsic) return this.inflateJSXIntrinsic(value)
    if (value instanceof ProtonJSX.Component) return this.inflateJSXComponent(value)
    if (value instanceof ProtonJSX._Fragment) return this.inflateFragment()

    throw new TypeError("Unsupported type of `jsx`", { cause: { jsx: value } })
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
    return this.jsxIntrinsicEvaluator.evaluate(intrinsic as never)
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    const shell = this.inflateComponent(component.type as never)

    let anchor: Node
    let anchorChildren: Node[] = Null.ARRAY

    if (shell.view instanceof DocumentFragment) {
      anchor = shell.view
      anchorChildren = [...shell.view.childNodes]
    } else if (shell.view instanceof Node) {
      anchor = shell.view
    } else {
      const comment = document.createComment(component.type.name)
      anchor = comment
    }

    let lastAnimationFrame = -1

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
