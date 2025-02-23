import { Primitive } from "type-fest"


/** @isolated */
namespace ProtonJSX {
  type Props = Record<keyof never, unknown> & JSX.CustomAttributes
  type Children = (Node | Primitive) | (Node | Primitive)[]
  type ChildrenExtrinsic = (Component | Primitive)[]

  export class Node {
    constructor(
      readonly type: keyof never | Function,
      readonly props?: Props | null,
      readonly children?: Children,
      readonly childrenExtrinsic?: ChildrenExtrinsic
    ) { }
  }


  export class Intrinsic extends Node { override type!: string; override props?: any }
  export class Component extends Node { override type!: Function }
  export class Fragment extends Node { }

  export function Element(type: keyof never | Function | Node, props: Props | null, children: Children | null, ...childrenExtrinsic: ChildrenExtrinsic) {
    if (type instanceof Node) {
      // @ts-expect-error ok.
      type.props = { ...type.props, ...props }
      return type
    }
    if (props?.children != null && children == null) children = props.children as Children

    if (type === FragmentSymbol) return new Fragment(type, props, children, childrenExtrinsic)
    if (typeof type === "string" || type instanceof Symbol) return new Intrinsic(type, props, children, childrenExtrinsic)

    return new Component(type, props, children, childrenExtrinsic)
  }
  export const FragmentSymbol = Symbol.for("Proton.Fragment")
}

export default ProtonJSX
