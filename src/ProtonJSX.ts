import { Primitive } from "type-fest"


type DocumentNode = Node

namespace ProtonJSX {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
  export interface Node {
    type: keyof never | Function

    props?: {}
    children?: (Node | Primitive)[]
    childrenExtrinsic?: (Component | Primitive)[]
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
  export class Node {
    constructor(type: keyof never | Function, props: unknown, children: unknown, childrenExtrinsic: unknown[]) {
      this.type = type

      if (props != null) this.props = props
      if (children != null) this.children = children instanceof Array ? children : [children]
      if (childrenExtrinsic != null && childrenExtrinsic.length !== 0) this.childrenExtrinsic = childrenExtrinsic as never
    }
  }

  export class Intrinsic extends Node { override type!: keyof never; override props?: JSX.HTMLSpecialAttributes }
  export class Component extends Node { override type!: Function }
  export class _Fragment extends Node { }


  export interface Element { }
  export interface ElementProps { }

  export function Element(type: keyof never | Function, props: ElementProps | null, children: Element | Element[] | null, ...childrenExtrinsic: Element[]) {
    if (type === Fragment) return new _Fragment(type, props, children, childrenExtrinsic)
    if (typeof type === "string" || type instanceof Symbol) return new Intrinsic(type, props, children, childrenExtrinsic)

    return new Component(type, props, children, childrenExtrinsic)
  }
  export const Fragment = Symbol.for("Proton.Fragment")













  export interface IntrinsicElement<Type extends keyof never = keyof never> {
    type: Type
    props: Record<keyof never, unknown> | null
    children: Element | Element[] | null
  }

  export abstract class IntrinsicEvaluator {
    public abstract evaluate(intrinsic: IntrinsicElement<keyof never>): unknown
  }
  export abstract class PrimitiveEvaluator {
    public abstract evaluate(primitive: Primitive): unknown
  }

  export class HTMLIntrinsicEvaluator extends IntrinsicEvaluator {
    constructor(
      protected readonly transformIntrinsic: <Type extends keyof HTMLElementTagNameMap>(input: IntrinsicElement<Type>) => typeof input,
      protected readonly transformElement: <T extends HTMLElement>(output: T) => T
    ) { super() }

    public override evaluate<Type extends keyof HTMLElementTagNameMap>(intrinsic: IntrinsicElement<Type>): HTMLElementTagNameMap[Type] {
      intrinsic = this.transformIntrinsic(intrinsic)

      const element = document.createElement(intrinsic.type)
      Object.assign(element, intrinsic.props)

      return this.transformElement(element)
    }
  }
  export class HTMLPrimitiveEvaluator extends PrimitiveEvaluator {
    public override evaluate(primitive: Primitive): DocumentNode {
      return document.createTextNode(String(primitive))
    }
  }
}

export default ProtonJSX
