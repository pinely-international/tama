import Events from "@/Events"

class TodoContext {
  readonly text: Events.State<string>

  constructor(text: string) {
    this.text = new Events.State<string>(text)
  }
}

export default TodoContext
