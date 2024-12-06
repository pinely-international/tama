import "@/assets/scss/base.scss"

import { Events, Proton } from "@denshya/proton"

import Navbar from "./ui/Navbar/Navbar"
import MiniProfile from "./ui/MiniProfile/MiniProfile"
import User from "./user/User"
import EditableAvatar from "./ui/EditableAvatar/EditableAvatar"


function App(this: Proton.Shell) {
  const user = new Events.State<User>({ email: "asd@as.com", firstName: "John", lastName: "Doe" })

  this.view.set(
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <MiniProfile user={user} />
        <EditableAvatar image="https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" />
      </main>
    </>
  )
}

export default App
