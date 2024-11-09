/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

interface ProtonNode {
  props?: {}
  children?: {}
  childrenExtrinsic?: {}
}

class ProtonNode {
  constructor(readonly type: string | Function, props: unknown, children: unknown, childrenExtrinsic: unknown[]) {
    if (props != null) this.props = props
    if (children != null) this.children = children instanceof Array ? children : [children]
    if (childrenExtrinsic != null && childrenExtrinsic.length !== 0) this.childrenExtrinsic = childrenExtrinsic
  }
}

class ProtonIntrinsicElement extends ProtonNode { }
class ProtonComponent extends ProtonNode { }

namespace Proton {
  export interface Element { }
  export interface ElementProps { }

  export function Element(type: string | Function, props: ElementProps | null, children: Element | Element[] | null, ...childrenExtrinsic: Element[]) {
    if (typeof type === "string") return new ProtonIntrinsicElement(type, props, children, childrenExtrinsic)

    return new ProtonComponent(type, props, children, childrenExtrinsic)
  }
  export const Fragment = Element
}

export default Proton

