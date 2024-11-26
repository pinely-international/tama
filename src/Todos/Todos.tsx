import "./Todos.scss"

import Events from "@/Events"
import Proton from "@/Proton"

import Todo from "./Todo"


function Todos(this: Proton.Shell) {
  const todos = new Events.State(["Wake Up", "Shower", "Eat", "Sleep"])
  const todosIndex = new Events.StateIndex(todos)


  const onAdd = () => todosIndex.push((todosIndex.length + 1).toString())
  const onReflow = () => this.tree.set(reflowed)
  const onReplace = () => todosIndex.replace(["1", "2", "3"])
  const onStateSet = () => todos.set(["A new", "data", "has come"])
  const onRebase = () => todosIndex.rebase()


  const reflowed = (
    <div className="todos">
      <ControlButtons />
      {todosIndex.map((todo, index) => (
        <div style={{ display: "flex", gap: "0.5em" }}>
          <div style={{ display: "grid", gap: "0.5em" }}>
            <span>Static index: {index}</span>
            <span>Static index: {todosIndex.indexOf(todo)}:</span>
            <span>Dynamic order: {todosIndex.orderOf(todo)}:</span>
          </div>
          <Todo content={todo} onRemove={() => todosIndex.nullAt(index)} />
        </div>
      ))}
    </div>
  )


  function ControlButtons(this: Proton.Shell) {
    this.tree.set(
      <div>
        <button type="button" on={{ click: onAdd }}>+</button>
        <button type="button" on={{ click: onReflow }}>Reflow</button>
        <button type="button" on={{ click: onReplace }}>Replace</button>
        <button type="button" on={{ click: onStateSet }}>Set new Todos State</button>
        <button type="button" on={{ click: onRebase }}>Rebase</button>
      </div>
    )
  }

  this.tree.set(
    <div className="todos">
      <ControlButtons />
      {todosIndex.map((todo, index) => <Todo content={todo} onRemove={() => todosIndex.nullAt(index)} />)}
    </div>
  )
}

export default Todos
