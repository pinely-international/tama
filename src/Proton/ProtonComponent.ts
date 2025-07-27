import { Messager } from "@denshya/reactive"

import Inflator from "@/Inflator/Inflator"
import TreeContextAPI from "@/TreeContextAPI"

import ViewAPI from "../ProtonViewAPI"


export class ProtonComponent {
  public readonly view: ViewAPI
  public readonly tree: TreeAPI
  public readonly inflator: Inflator

  constructor(inflator: Inflator, parent?: ProtonComponent) {
    this.inflator = Inflator.cloneWith(inflator, this)
    this.view = new ViewAPI
    this.tree = new TreeAPI(parent?.tree)
  }
}

class TreeAPI {
  public readonly context: TreeContextAPI

  private readonly thrown = new Messager<unknown>

  constructor(private readonly parent?: TreeAPI) {
    this.context = new TreeContextAPI(this.parent?.context)

    parent?.thrown.subscribe(this.thrown.dispatch.bind(this.thrown))
  }

  /** @internal */
  caught(thrown: unknown) { this.thrown.dispatch(thrown) }
  catch(callback: (thrown: unknown) => void) { return this.thrown.subscribe(callback) }


}


function Component(this: ProtonComponent) {
  this.view.set(1)

  this.view.life.when("enter")
  this.view.life.when("exit")
  this.view.life.adopt(new Asd)

  this.tree.catch()

  this.tree.context.require()

  this.tree.context
}

class Asd {
  onEnter() { }
  onExit() { }
}
