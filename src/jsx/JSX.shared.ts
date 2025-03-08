import { IsEqual, LiteralUnion } from "type-fest"

import { Accessible, AccessorGet } from "../Accessor"
import Guarded from "../Guarded"
import Observable from "../Observable"


/** https://github.com/type-challenges/type-challenges/issues/139 */
type GetReadonlyKeys<
  T,
  U extends Readonly<T> = Readonly<T>,
  K extends keyof T = keyof T
> = K extends keyof T ? IsEqual<Pick<T, K>, Pick<U, K>> extends true ? K : never : never;


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
      type: any
      props: any
      children?: any
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementTypeConstructor { }
    interface ElementTypeConstructor {
      (this: never, props: never): unknown
    }
    type ElementType = string | Element | ElementTypeConstructor

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementChildrenAttribute { children: {} }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementAttributesProperty { props: {} }


    type Attribute<T> =
      | T
      | Observable<T>
      | Accessible<T>
      | (Observable<T> & Accessible<T>)
      | (Guarded<T> & Observable<T>)
      | (Guarded<T> & Accessible<T>)
      | (Guarded<T> & Observable<T> & Accessible<T>)

    type Children<T extends JSX.Element> = T | Iterable<T>

    type HTMLElementEvents = {
      [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
    }

    interface IntrinsicAttributes {
      mounted?: AccessorGet<unknown> & Observable<unknown>
    }

    interface CustomAttributes {
      ns?: LiteralUnion<string, "http://www.w3.org/1999/xhtml" | "http://www.w3.org/2000/svg" | "http://www.w3.org/1998/Math/MathML">
      on?: HTMLElementEvents
      style?: Attribute<Record<string, Attribute<string | CSSStyleValue>> | { [K in keyof CSSStyleDeclaration]?: Attribute<CSSStyleDeclaration[K] | CSSStyleValue | null | undefined> } | string>
    }

    type AttributesOf<T> = _AttributesOf<T>["Attributes"]

    type HTMLElementAttributes<T> = Partial<AttributesOf<T>> & CustomAttributes & IntrinsicAttributes & { children?: unknown }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    type SVGElementAttributes<T> = HTMLElementAttributes<T> & (T extends SVGURIReference ? SVGURIReferenceAttribute : {}) & { class?: Attribute<string> }

    type SVGURIReferenceAttribute = SVGURIReference | { href?: Attribute<string> }


    type HTMLElements = { [Tag in keyof HTMLElementTagNameMap]: HTMLElementAttributes<HTMLElementTagNameMap[Tag]> }
    type SVGElements = { [Tag in keyof SVGElementTagNameMap]: SVGElementAttributes<SVGElementTagNameMap[Tag]> }
    type MathMLElements = { [Tag in keyof MathMLElementTagNameMap]: HTMLElementAttributes<MathMLElementTagNameMap[Tag]> }

    interface IntrinsicElements extends HTMLElements, SVGElements, MathMLElements { }
  }
}

export { }
