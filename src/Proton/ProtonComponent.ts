import { Messager } from "@denshya/reactive"

import { Disposal } from "@/Disposal"
import Inflator from "@/Inflator/Inflator"
import TreeContextAPI from "@/TreeContextAPI"

import ViewAPI from "../ProtonViewAPI"

export class ProtonComponent {
  public readonly view: ViewAPI
  public readonly tree: TreeAPI
  public readonly inflator: Inflator
  public readonly disposal: Disposal

  constructor(inflator: Inflator, parent?: ProtonComponent) {
    this.inflator = Inflator.cloneWith(inflator, this)
    this.view = new ViewAPI
    this.tree = new TreeAPI(parent?.tree)
    this.disposal = new Disposal
  }
}



class TreeAPI {
  public readonly context: TreeContextAPI

  constructor(private readonly parent?: TreeAPI) {
    this.context = new TreeContextAPI(this.parent?.context)

    parent?.thrown.subscribe(this.thrown.dispatch.bind(this.thrown))
  }

  /** @internal */
  readonly thrown = new Messager<unknown>
  /** @internal */
  caught(thrown: unknown) { this.thrown.dispatch(thrown) }
  catch(callback: (thrown: unknown) => void) { void this.thrown.subscribe(callback) }
}
