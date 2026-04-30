import { Group } from "node-group"

import { onDemandRef } from "./Inflator/web/helpers"

export class InsertionGroup extends Group {
  private placeholder = onDemandRef(() => document.createComment(this.constructor.name))

  replaceChildren(...nodes: (Node | string)[]): void {
    if (nodes.length === 0 || nodes.every(node => (node as any)?.nodeType === Node.DOCUMENT_FRAGMENT_NODE && (node as DocumentFragment).childNodes.length === 0)) {
      super.replaceChildren(this.placeholder.current)
    } else {
      super.replaceChildren(...nodes)
    }
  }

  parent?: ParentNode
}
