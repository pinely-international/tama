import Events from "@/Events"
import Proton from "@/Proton"

import TodoContext from "./Todo.context"


class TodoProps {
  readonly content = new Events.State<string>("Empty")

  onRemove?(): void
}

async function Todo(this: Proton.Shell, props = new TodoProps) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000))

  const todoContext = this.context.require(TodoContext)

  this.view.set(
    <div className="todo">
      {todoContext.text}
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
      <textarea />
      <button type="button" on={{ click: () => props.content.set("") }}>-</button>
    </div>
  )
}

export default Todo
