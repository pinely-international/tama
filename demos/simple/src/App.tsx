import { Proton } from "@denshya/proton"
import Navbar from "./Navbar/Navbar"

function App(this: Proton.Shell) {
  this.view.set(
    <main>
      <head>
        <meta name="description" content="blabla" />
      </head>
      <header>
        <Navbar />
      </header>
    </main>
  )
}

export default App
