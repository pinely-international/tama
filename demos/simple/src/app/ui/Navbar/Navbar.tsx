import "./Navbar.scss"

import { NavLink } from "@/navigation"


function Navbar() {
  return (
    <div className="navbar">
      <NavLink className="navbar__link" to="/">Home</NavLink>
      <NavLink className="navbar__link" to="/documentation">Documentation</NavLink>

      <NavLink className="navbar__link" to="/profile">Profile</NavLink>
      <NavLink className="navbar__link" to="/market">Market</NavLink>
    </div>
  )
}

export default Navbar
