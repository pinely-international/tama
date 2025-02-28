import { Primitive } from "type-fest"
import JSXVirtual from "./JSXVirtual"
import WebInflator from "@/Inflator/web/WebInflator"

namespace JSXNative {
  type Props = Record<keyof never, unknown> & JSX.CustomAttributes
  type Children = (JSXVirtual.Node | Primitive) | (JSXVirtual.Node | Primitive)[]
  type ChildrenExtrinsic = (JSXVirtual.Component | Primitive)[]

  export let inflator = new WebInflator

  export function Element(type: keyof never | Function, props: Props | null, children: Children | null, ...childrenExtrinsic: ChildrenExtrinsic) {
    if (props?.children != null && children == null) children = props.children as Children


    if (type === FragmentSymbol) return [...(children instanceof Array ? children : [children]), ...childrenExtrinsic]
    if (typeof type === "string") {
      const element = inflator.inflateIntrinsic(type, props)
      children = (children instanceof Array ? children : [children])
      children.forEach(child => element.appendChild(inflator.inflate(child)))
      return element
    }


    return new JSXVirtual.Component(type, props, children, childrenExtrinsic)
  }
  export const FragmentSymbol = Symbol.for("Proton.Fragment")
}

export default JSXNative
