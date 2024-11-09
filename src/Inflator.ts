import { Primitive } from "type-fest"

import JSX from "./JSX"
import Proton from "./Proton"


abstract class Inflator {
  public abstract inflate(subject: never): unknown
  protected abstract inflatePrimitive(primitive: Primitive): unknown
  protected abstract inflateFragment(): unknown
}

export class WebInflator extends Inflator {
  protected jsxIntrinsicEvaluator = new JSX.HTMLIntrinsicEvaluator(
    function transformIntrinsic(input) { return input },
    function transformElement(element) { return element }
  )

  public inflate<T>(subject: T): T extends Node ? T : (T extends Proton.Node ? (HTMLElement | DocumentFragment) : (T extends Exclude<Primitive, null | undefined> ? Node : T)) {
    if (subject == null) return subject as never
    if (subject instanceof Node) return subject as never
    if (subject instanceof Proton.Node) return this.inflateJSXDeeply(subject) as never

    switch (typeof subject) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "symbol":
        return this.inflatePrimitive(subject) as never

      default:
        return this.inflatePrimitive(String(subject)) as never
    }
  }
  protected inflatePrimitive(primitive: Primitive): Node {
    return document.createTextNode(String(primitive))
  }

  protected inflateFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  protected inflateJSX(value: Proton.Node | Primitive): HTMLElement | DocumentFragment | Node {
    if (value instanceof Proton.Intrinsic) return this.inflateJSXIntrinsic(value)
    if (value instanceof Proton.Component) return this.inflateJSXComponent(value)
    if (value instanceof Proton._Fragment) return this.inflateFragment()

    throw new TypeError("Unsupported type of `jsx`", { cause: { jsx: value } })
  }

  private inflateJSXDeeply(value: Proton.Node | Primitive): HTMLElement | DocumentFragment | Node {
    const object = this.inflateJSX(value)
    if (value instanceof Proton.Node === false) return object

    const appendChildObject = (child: Proton.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (childInflated == null) return

      object.appendChild(childInflated)
    }

    value.children?.forEach(appendChildObject)
    value.childrenExtrinsic?.forEach(appendChildObject)

    return object
  }

  protected inflateJSXIntrinsic(intrinsic: Proton.Intrinsic): HTMLElement | DocumentFragment {
    return this.jsxIntrinsicEvaluator.evaluate(intrinsic as never)
  }

  protected inflateJSXComponent(component: Proton.Component): HTMLElement | DocumentFragment | Node {
    return document.createTextNode(component.type.name)
  }
}
