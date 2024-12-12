import "@/assets/scss/base.scss"

import { Events, Proton } from "@denshya/proton"

import Navbar from "./app/ui/Navbar/Navbar"
import MiniProfile from "./app/ui/MiniProfile/MiniProfile"
import User from "./app/user/User"
import EditableAvatar from "./app/ui/EditableAvatar/EditableAvatar"
import { NavRoute } from "./navigation"
import Game from "./tictactoe/tictactoe"
import UserContext from "./UserContext"






function App(this: Proton.Shell) {
  const user = new Events.State<User>({ email: "asd@as.com", firstName: "John", lastName: "Doe" })
  const userContext = new UserContext(user)

  this.context.provide(userContext)

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <MiniProfile />
        <EditableAvatar image="https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" />

        <section>
          <NavRoute path="/"><span>123</span></NavRoute>
          <NavRoute path="/terms">Terms</NavRoute>
          <NavRoute path="/contacts">Contacts</NavRoute>
          <NavRoute path="/tictactoe"><Game /></NavRoute>
        </section>
      </main>
    </>
  )
}

export default App
