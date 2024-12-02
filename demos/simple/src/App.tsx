import "@/assets/scss/base.scss"

import { Proton } from "@denshya/proton"

import Navbar from "./ui/Navbar/Navbar"
import MiniProfile from "./ui/MiniProfile/MiniProfile"
import User from "./user/User"


function App(this: Proton.Shell) {
  const user = { avatar: "", email: "asd@as.com", firstName: "John", lastName: "Doe" } as User | undefined

  this.view.set(
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <MiniProfile user={user} />
      </main>
    </>
  )
}

export default App
