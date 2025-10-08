import { Group } from "node-group"

import { onDemandRef } from "./Inflator/web/helpers"

export class InsertionGroup extends Group {
  private placeholder = onDemandRef(() => document.createComment(this.constructor.name))

  replaceChildren(...nodes: (Node | string)[]): void {
    if (nodes.length > 0) {
      super.replaceChildren(...nodes)
    } else {
      super.replaceChildren(this.placeholder.current)
    }
  }

  parent?: ParentNode
}
