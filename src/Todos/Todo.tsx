import Events from "@/Events"
import Proton from "@/Proton"


class TodoProps {
  readonly content = new Events.State<string>("Empty")

  onRemove?(): void
}

function Todo(this: Proton.Shell, props = new TodoProps) {
  this.tree.set(
    <div className="todo">
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
      <textarea />
      <button type="button" on={{ click: () => props.content.set("") }}>-</button>
    </div>
  )
}

export default Todo
