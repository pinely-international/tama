import "@/assets/scss/base.scss"

import { Events, Proton } from "@denshya/proton"

import Navbar from "./ui/Navbar/Navbar"
import MiniProfile from "./ui/MiniProfile/MiniProfile"
import User from "./user/User"


function App(this: Proton.Shell) {
  const user = new Events.State<User>({ avatar: "", email: "asd@as.com", firstName: "John", lastName: "Doe" })

  this.view.set(
    <>
      <header>
        <Navbar />
      </header>
      <main>
        {/* <MiniProfile user={user} /> */}
      </main>
    </>
  )
}

export default App
