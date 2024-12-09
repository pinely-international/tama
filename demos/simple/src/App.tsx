import "@/assets/scss/base.scss"

import { Events, Proton } from "@denshya/proton"

import Navbar from "./app/ui/Navbar/Navbar"
import MiniProfile from "./app/ui/MiniProfile/MiniProfile"
import User from "./app/user/User"
import EditableAvatar from "./app/ui/EditableAvatar/EditableAvatar"
import { router } from "./router"


function App(this: Proton.Shell) {
  const user = new Events.State<User>({ email: "asd@as.com", firstName: "John", lastName: "Doe" })

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <MiniProfile user={user} />
        <EditableAvatar image="https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" />

        <section>
          <Route path="/"><span>123</span></Route>
          <Route path="/terms">Terms</Route>
          <Route path="/contacts">Contacts</Route>
        </section>
      </main>
    </>
  )
}

export default App

function Route(this: Proton.Shell, props: { path: string; children: unknown }) {
  let children: unknown

  router[Symbol.subscribe](path => {
    if (children == null) children = this.inflator.inflate(<>{props.children}</>)

    this.view.set(path === props.path ? children : null)
  })
}
