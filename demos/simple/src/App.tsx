import { Proton } from "@denshya/proton"

function App(this: Proton.Shell) {
  this.view.set(<div>123</div>)
}

export default App
