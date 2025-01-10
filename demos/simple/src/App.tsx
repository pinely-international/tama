import "@/assets/scss/base.scss"

import { Proton } from "@denshya/proton"

import Navbar from "./app/ui/Navbar/Navbar"
import MiniProfile from "./app/ui/MiniProfile/MiniProfile"
import User from "./app/user/User"
import EditableAvatar from "./app/ui/EditableAvatar/EditableAvatar"
import { NavRoute } from "./navigation"
import UserContext from "./UserContext"
import { Flow } from "@denshya/flow"


const TictactoeGame = Proton.Lazy(() => import("./tictactoe/tictactoe"))
const ProductsTableApp = Proton.Lazy(() => import("./products-table/ProductsTable"))
const Market = Proton.Lazy(() => import("./areas/market/components/Market/Market"))
const ProductPage = Proton.Lazy(() => import("./areas/market/components/ProductPage/ProductPage"))


function App(this: Proton.Shell) {
  const user = new Flow<User>({ email: "my@penis.big", firstName: "Valery", lastName: "Zinchenko", username: "FrameMuse" })
  const userContext = new UserContext(user)

  this.context.provide(userContext)

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <NavRoute path="/"><span>123</span></NavRoute>
        <NavRoute path="/documentation">Documentation</NavRoute>
        <NavRoute path="/profile">
          <MiniProfile />
          <EditableAvatar image="https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" />
        </NavRoute>
        <NavRoute path="/tictactoe"><TictactoeGame /></NavRoute>
        <NavRoute path="/products-table"><ProductsTableApp /></NavRoute>
        <NavRoute path="/market"><Market /></NavRoute>
        <NavRoute path="/market/product/:id"><ProductPage /></NavRoute>
      </main>
    </>
  )
}

export default App
