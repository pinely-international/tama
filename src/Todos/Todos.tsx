import "./Todos.scss"

import Events from "@/Events"
import Proton from "@/Proton"

import Todo from "./Todo"


function Todos(this: Proton.Shell) {
  const todosIndex = new Events.StateIndex(["Wake Up", "Shower", "Eat", "Sleep"])



  const onAdd = () => todosIndex.push((todosIndex.length + 1).toString())
  const onReflow = () => this.tree.set(
    <div className="todos">
      {controlButtons}
      {/* <Todo /> */}
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

  const onRebase = () => todosIndex.replace(["1", "2", "3"])
  // const onDestroy = () => this.tree.detach()

  function ControlButtons(this: Proton.Shell) {
    this.tree.set(
      <>
        <button type="button" on={{ click: onAdd }}>+</button>
        <button type="button" on={{ click: onReflow }}>Reflow</button>
        <button type="button" on={{ click: onRebase }}>Rebase</button>
        {/* <button type="button" on={{ click: onDestroy }}>Destroy</button> */}
      </>
    )
  }

  const controlButtons = this.inflator.inflate(<ControlButtons />)

  this.tree.set(
    <div className="todos">
      {controlButtons}
      {/* <Todo /> */}
      {todosIndex.map((todo, index) => <Todo content={todo} onRemove={() => todosIndex.nullAt(index)} />)}
    </div>
  )
}

export default Todos
