import "@/assets/scss/base.scss"

import { Proton } from "@denshya/proton"

import Navbar from "./ui/Navbar/Navbar"
import MiniProfile from "./ui/MiniProfile/MiniProfile"


function App(this: Proton.Shell) {
  this.view.set(
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <MiniProfile user={{ avatar: "", email: "asd@as.com", firstName: "John", lastName: "Doe" }} />
      </main>
    </>
  )
}

export default App
