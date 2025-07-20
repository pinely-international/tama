import Inflator from "@/Inflator/Inflator"

import ProtonViewAPI from "../ProtonViewAPI"
import TreeContextAPI from "../TreeContextAPI"


export class ProtonComponent {
  public readonly view: ProtonViewAPI
  public readonly inflator: Inflator
  public readonly context: TreeContextAPI
  public

  /** @internal Debug value for `constructor` which evaluated this component. */
  declare factory: Function

  constructor(inflator: Inflator, parent?: ProtonComponent) {
    this.inflator = Inflator.cloneWith(inflator, this)
    this.context = new TreeContextAPI(parent?.context)
    this.view = new ProtonViewAPI(this.inflator)
  }
}
