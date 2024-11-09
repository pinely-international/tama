/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

import { Primitive } from "type-fest"

declare global {
  namespace JSX {
    interface CustomElement {
      ReturnType: Proton.Shell
    }
  }
}

namespace Proton {
  export interface Shell { }


  export interface Node {
    type: keyof never | Function

    props?: {}
    children?: (Node | Primitive)[]
    childrenExtrinsic?: (Component | Primitive)[]
  }

  export class Node {
    constructor(type: keyof never | Function, props: unknown, children: unknown, childrenExtrinsic: unknown[]) {
      this.type = type

      if (props != null) this.props = props
      if (children != null) this.children = children instanceof Array ? children : [children]
      if (childrenExtrinsic != null && childrenExtrinsic.length !== 0) this.childrenExtrinsic = childrenExtrinsic as never
    }
  }

  export class Intrinsic extends Node { override type!: keyof never }
  export class Component extends Node { override type!: <T>(T: Shell) => T }
  export class _Fragment extends Node { }


  export interface Element { }
  export interface ElementProps { }

  export function Element(type: keyof never | Function, props: ElementProps | null, children: Element | Element[] | null, ...childrenExtrinsic: Element[]) {
    if (typeof type === "string" || type instanceof Symbol) return new Intrinsic(type, props, children, childrenExtrinsic)

    return new Component(type, props, children, childrenExtrinsic)
  }
  export function Fragment(type: never, props: ElementProps | null, children: Element | Element[] | null, ...childrenExtrinsic: Element[]) {
    return new _Fragment(type, props, children, childrenExtrinsic)
  }
}

export default Proton

