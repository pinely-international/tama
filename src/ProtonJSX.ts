import { Primitive } from "type-fest"


/** @isolated */
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export class Intrinsic extends Node { override type!: keyof never; override props?: any }
  export class Component extends Node {
    override type!: Function

    constructor(type: keyof never | Function, props: unknown, children: unknown, childrenExtrinsic: unknown[]) {
      super(type, props, children, childrenExtrinsic)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.props ??= {} as any

      if (children != null || childrenExtrinsic != null) {
        this.props.children = []
        this.children && this.props.children.push(...this.children)
        childrenExtrinsic && this.props.children.push(...childrenExtrinsic)
      }
    }

  }
  export class _Fragment extends Node { }


  export interface Element { }
  export interface ElementProps { }

  export function Element(type: keyof never | Function, props: ElementProps | null, children: Element | Element[] | null, ...childrenExtrinsic: Element[]) {
    if (props?.children != null && children == null) children = props.children

    if (type === Fragment) return new _Fragment(type, props, children, childrenExtrinsic)
    if (typeof type === "string" || type instanceof Symbol) return new Intrinsic(type, props, children, childrenExtrinsic)

    return new Component(type, props, children, childrenExtrinsic)
  }
  export const Fragment = Symbol.for("Proton.Fragment")
}

export default ProtonJSX
