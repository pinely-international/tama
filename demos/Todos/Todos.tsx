import "./Todos.scss"

import Events from "@/Events"
import Proton from "@/Proton"

import Todo from "./Todo"
import TodoContext from "./Todo.context"


async function Todos(this: Proton.Component) {
  this.view.set(<div>Parent Loading...</div>)
  await new Promise(resolve => setTimeout(resolve, 1000))


  const todoContext = this.context.provide(new TodoContext("Test"))
  setInterval(() => todoContext.text.set(Date.now().toString()), 1000)


  this.catch<Error>(error => {
    console.error("caught", error)
    this.view.set(
      <div>
        <span>Error: {error.message}</span>
        <button type="button" on={{ click: () => this.view.set(defaultView) }}>Restore</button>
      </div>
    )
  })
  this.suspense(() => this.view.set(<div>Children Loading...</div>))
  this.unsuspense(() => this.view.reset())


  const style = new Events.State("display: grid; gap: 0.5em")

  const todos = new Events.State(["Wake Up", "Shower", "Eat", "Sleep"])
  const todosIndex = new Events.StateIndex(todos)


  const onAdd = () => todosIndex.push((todosIndex.length + 1).toString())
  const onReflow = () => this.view.set(newView)
  const onReplace = () => todosIndex.replace(["1", "2", "3"])
  const onStateSet = () => todos.set(["A new", "data", "has come"])
  const onRebase = () => todosIndex.rebase()
  const onRestyle = () => style.set("display: flex; gap: 0.5em")
  const onThrowError = () => { throw new Error("Event error") }


  const newView = (
    <div className="todos">
      <ControlButtons />
      {todosIndex.map((todo, index) => (
        <div style={{ display: "flex", gap: "0.5em" }}>
          <div style={style}>
            <span>Static index: {index}</span>
            <span>Static index: {todosIndex.indexOf(todo)}:</span>
            <span>Dynamic order: {todosIndex.orderOf(todo)}:</span>
          </div>
          <Todo content={todo} onRemove={() => todosIndex.nullAt(index)} />
        </div>
      ))}
    </div>
  )


  function ControlButtons(this: Proton.Component) {
    this.view.set(
      <div>
        <button type="button" on={{ click: onAdd }}>+</button>
        <button type="button" on={{ click: onReflow }}>Reflow</button>
        <button type="button" on={{ click: onReplace }}>Replace</button>
        <button type="button" on={{ click: onStateSet }}>Set new Todos State</button>
        <button type="button" on={{ click: onRebase }}>Rebase</button>
        <button type="button" on={{ click: onRestyle }}>Restyle</button>
        <button type="button" on={{ click: onThrowError }}>Throw Error</button>
      </div>
    )
  }


  const mousePosition = new Events.State<[number, number]>([0, 0])

  const defaultView = (
    <div className="todos" on={{ pointermove: event => mousePosition.set([event.x, event.y]) }}>
      <span>{mousePosition}</span>
      <span>{mousePosition.to(([x, y]) => `${x}px ${y}px`)}</span>
      <span>{mousePosition.it[0]}px {mousePosition.it[1]}px</span>
      <button type="button" on={{ click: () => mousePosition.it = [0, 0] }}>Reset Mouse Position</button>

      <ControlButtons />
      {todosIndex.map((todo, index) => <Todo content={todo} onRemove={() => todosIndex.nullAt(index)} />)}
    </div>
  )

  this.view.set(defaultView)
}

export default Todos
