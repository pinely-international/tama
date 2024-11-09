import "./JSX.d"

import { Primitive as TypeFestPrimitive } from "type-fest"

namespace JSX {
  export interface IntrinsicElement<Type extends keyof never = keyof never> {
    type: Type
    props: Record<keyof never, unknown> | null
    children: Element | Element[] | null
  }

  export abstract class IntrinsicEvaluator {
    public abstract evaluate(intrinsic: JSX.IntrinsicElement<keyof never>): unknown
  }
  export abstract class PrimitiveEvaluator {
    public abstract evaluate(primitive: TypeFestPrimitive): unknown
  }

  export class HTMLIntrinsicEvaluator extends IntrinsicEvaluator {
    constructor(
      protected readonly transformIntrinsic: <Type extends keyof HTMLElementTagNameMap>(input: JSX.IntrinsicElement<Type>) => typeof input,
      protected readonly transformElement: <T extends HTMLElement>(output: T) => T
    ) { super() }

    public override evaluate<Type extends keyof HTMLElementTagNameMap>(intrinsic: JSX.IntrinsicElement<Type>): HTMLElementTagNameMap[Type] {
      intrinsic = this.transformIntrinsic(intrinsic)

      const element = document.createElement(intrinsic.type)
      Object.assign(element, intrinsic.props)

      return this.transformElement(element)
    }
  }
  export class HTMLPrimitiveEvaluator extends PrimitiveEvaluator {
    public override evaluate(primitive: TypeFestPrimitive): Node {
      return document.createTextNode(String(primitive))
    }
  }
}

export default JSX
