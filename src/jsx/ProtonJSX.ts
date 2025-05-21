import { Primitive } from "type-fest"


/** @isolated */
namespace ProtonJSX {
  type Props = Record<keyof never, unknown> & JSX.CustomAttributes & { children?: Children }
  type Children = (Node | Primitive) | (Node | Primitive)[]

  export class Node {
    constructor(
      readonly type: keyof never | Function,
      readonly props?: Props | null,
    ) { }
  }


  export class Intrinsic extends Node { override type!: keyof never; override props?: any }
  export class Component extends Node { override type!: Function }
  export class Fragment extends Node { }

  export function Element(type: keyof never | Function | Node, props: Props | null) {
    if (type instanceof Node) {
      // @ts-expect-error ok.
      type.props = { ...type.props, ...props }
      return type
    }

    if (type === FragmentSymbol) return new Fragment(type, props)
    if (typeof type === "string" || type.constructor === Symbol) return new Intrinsic(type, props)

    return new Component(type, props)
  }
  export const FragmentSymbol = Symbol.for("Proton.Fragment")
}

export default ProtonJSX
