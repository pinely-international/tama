import { IsEqual } from "type-fest"

import { Accessible, AccessorGet } from "./Accessor"
import Guarded from "./Guarded"
import Observable from "./Observable"


export { }

/** https://github.com/type-challenges/type-challenges/issues/139 */
type GetReadonlyKeys<
  T,
  U extends Readonly<T> = Readonly<T>,
  K extends keyof T = keyof T
> = K extends keyof T ? IsEqual<Pick<T, K>, Pick<U, K>> extends true ? K : never : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = ((...args: any[]) => unknown)


interface _AttributesOf<T> {
  ReadonlyKeys: GetReadonlyKeys<T>
  Attributes: {
    [K in (keyof T) as (
      K extends this["ReadonlyKeys"] ? never :
      AnyFunction extends T[K] ? never :
      T[K] extends AnyFunction ? never :
      K
    )]: JSX.Attribute<T[K]>
  }
}

declare global {
  namespace JSX {
    interface Element {
      type: never
      props: never
      children: []
    }

    interface ElementTypeConstructor { }
    type ElementType = string | ElementTypeConstructor


    type Attribute<T> =
      | T
      | Observable<T>
      | Accessible<T>
      | (Observable<T> & Accessible<T>)
      | (Guarded<T> & Observable<T>)
      | (Guarded<T> & Accessible<T>)
      | (Guarded<T> & Observable<T> & Accessible<T>)

    type HTMLElementEvents = {
      [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
    }

    interface IntrinsicAttributes {
      mounted?: AccessorGet<T> & Observable<T>
    }

    interface HTMLSpecialAttributes {
      on?: HTMLElementEvents
      style?: Attribute<Record<string, Attribute<string | CSSStyleValue>> | { [K in keyof CSSStyleDeclaration]?: Attribute<CSSStyleDeclaration[K] | CSSStyleValue | null | undefined> } | string>
    }

    type AttributesOf<T> = _AttributesOf<T>["Attributes"]

    type HTMLElementAttributes<T> = Partial<AttributesOf<T>> & HTMLSpecialAttributes & IntrinsicAttributes
    type SVGElementAttributes<T> = HTMLElementAttributes<T> & (T extends SVGURIReference ? SVGURIReferenceAttribute : never)

    type SVGURIReferenceAttribute = SVGURIReference | Attribute<string>


    type HTMLElements = { [Tag in keyof HTMLElementTagNameMap]: HTMLElementAttributes<HTMLElementTagNameMap[Tag]> }
    type SVGElements = { [Tag in keyof SVGElementTagNameMap]: SVGElementAttributes<SVGElementTagNameMap[Tag]> }
    type MathMLElements = { [Tag in keyof MathMLElementTagNameMap]: HTMLElementAttributes<MathMLElementTagNameMap[Tag]> }

    interface IntrinsicElements extends HTMLElements, SVGElements, MathMLElements { }
  }
}
