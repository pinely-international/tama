import "./Navbar.scss"

import { Proton } from "@denshya/proton"
import { NavLink } from "@/navigation"


function Navbar() {
  return (
    <div className="navbar">
      <NavLink className="navbar__link" to="/">Home</NavLink>
      <NavLink className="navbar__link" to="/terms">Terms</NavLink>
      <NavLink className="navbar__link" to="/contacts">Contacts</NavLink>
      <NavLink className="navbar__link" to="/tictactoe">Tic-Tac-Toe</NavLink>
    </div>
  )
}

export default Navbar
