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

  protected inflateComponent(componentConstructor: <T extends Proton.Shell>(this: T) => T) {
    const shell = new Proton.Shell(this)

    const component = componentConstructor.call(shell)
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
    const shellInternal = shell[Proton.ShellInternal]

    if (shellInternal.view instanceof DocumentFragment) {
      shellInternal.anchor = shellInternal.view
      shellInternal.anchors = [...shellInternal.view.childNodes]
    } else if (shellInternal.view instanceof Node) {
      shellInternal.anchor = shellInternal.view
      shellInternal.anchors = Null.ARRAY
    } else {
      const comment = document.createComment(component.type.name)
      shellInternal.anchor = comment
      shellInternal.anchors = [comment]
    }

    shell.lastAnimationFrame = -1

    shell.onViewChange(view => {
      if (view instanceof Node === false) return

      // Assume that the anchor node was already connected.
      const schedule = () => {
        if (shellInternal.anchor instanceof Node === false) return

        const anchors = shellInternal.anchors ?? Null.ARRAY

        const anchor = anchors.shift()
        if (anchor == null) {
          shellInternal.anchor.replaceWith(shellInternal.view)
          shellInternal.anchor = view

          return
        }

        const parent = anchor instanceof Node && anchor.parentElement
        if (!parent) return

        anchors.forEach(rest => parent.removeChild(rest as never))

        shellInternal.anchor = view
        shellInternal.anchors = [...view.childNodes]

        parent.replaceChild(view, anchor)
      }




      cancelAnimationFrame(shell.lastAnimationFrame)
      shell.lastAnimationFrame = requestAnimationFrame(schedule)
    })

    return shellInternal.anchor as never
  }
}
