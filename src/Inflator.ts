import { Primitive } from "type-fest"

import ActBindings from "./ActBinding"
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

    return intrinsicInflated
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    const shell = this.inflateComponent(component.type as never, component.props ?? Null.OBJECT)
    return shell.asd()
  }
}

