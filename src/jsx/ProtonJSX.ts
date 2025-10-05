import { Primitive } from "type-fest"


/** @internal */
namespace ProtonJSX {
  type Props = Record<keyof never, unknown> & JSX.CustomAttributes & { children?: Children }
  type Children = (Node | Primitive) | (Node | Primitive)[]

  export function Element(type: keyof never | Function | Node, props: Props | null) {
    return { type, props }
  }
  export const FragmentSymbol = Symbol.for("Proton.Fragment")
}

export default ProtonJSX
