import Deferred from "@/Deferred"
import Events from "@/Events"
import Proton from "@/Proton"

import TodoContext from "./Todo.context"


class TodoProps {
  readonly content = new Events.State<string>("Empty")

  onRemove?(): void
}

const deferreds = new WeakMap<Proton.Shell, Deferred<unknown>>()

async function Todo(this: Proton.Shell, props = new TodoProps) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
  // const deferred = deferreds.has(this) ? deferreds.get(this)! : deferreds.set(this, new Deferred).get(this)!
  // if (!deferred.awaited) {
  //   setTimeout(deferred.resolve, Math.random() * 1000)
  //   throw deferred.promise
  // }

  const todoContext = this.context.require(TodoContext)

  this.view.set(
    <div className="todo">
      {todoContext.text}
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
      <textarea />
      <button type="button" on={{ click: () => props.content.set("") }}>-</button>
      <button type="button" on={{ click: (event) => props.content.set(`${event.offsetX}px ${event.offsetY}px`) }}>Set Mouse Offset</button>
    </div>
  )
}

export default Todo
