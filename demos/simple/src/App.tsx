import "@/assets/scss/base.scss"

import { Flow } from "@denshya/flow"
import { Proton } from "@denshya/proton"

import EditableAvatar from "./app/ui/EditableAvatar/EditableAvatar"
import LoaderCover from "./app/ui/Loader/LoaderCover"
import MiniProfile from "./app/ui/MiniProfile/MiniProfile"
import Navbar from "./app/ui/Navbar/Navbar"
import User from "./app/user/User"
import { NavRoute } from "./navigation"
import UserContext from "./UserContext"


const Circles = Lazy(() => import("./Circles/Circles"))
const TictactoeGame = Lazy(() => import("./tictactoe/tictactoe"))
const ProductsTableApp = Lazy(() => import("./products-table/ProductsTable"))
const Market = Lazy(() => import("./areas/market/components/Market/Market"))
const ProductPage = Lazy(() => import("./areas/market/components/ProductPage/ProductPage"))

function Lazy<T extends JSX.ElementTypeConstructor>(importFactory: () => Promise<{ default: T } | T>) {
  return async function lazy(this: Proton.Component) {
    this.view.set(<LoaderCover />)
    const Module = await importFactory()


    if ("default" in Module) return <Module.default />
    return <Module />
  }
}


function App(this: Proton.Component) {
  const user = new Flow<User>({ email: "my@penis.big", firstName: "Valery", lastName: "Zinchenko", username: "FrameMuse" })
  const userContext = new UserContext(user)

  this.context.provide(userContext)

  this.suspense(() => this.view.set(<LoaderCover />))
  this.unsuspense(() => this.view.set(this.view.default))

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <NavRoute path="/"><span>123</span></NavRoute>
        <NavRoute path="/documentation">Documentation</NavRoute>

        <NavRoute path="/circles"><Circles /></NavRoute>

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
