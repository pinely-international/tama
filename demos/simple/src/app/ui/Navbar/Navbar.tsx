import "./Navbar.scss"

import { NavLink } from "@/navigation"


function Navbar() {
  return (
    <div className="navbar">
      {/* <NavLink className="navbar__link" to="/">Home</NavLink>
        <NavLink className="navbar__link" to="/documentation">Documentation</NavLink>

        <NavLink className="navbar__link" to="/profile">Profile</NavLink>
        <NavLink className="navbar__link" to="/blog">Blog</NavLink>
        <NavLink className="navbar__link" to="/messenger">Messenger</NavLink>
        <NavLink className="navbar__link" to="/market">Market</NavLink>
        <NavLink className="navbar__link" to="/orders">Orders</NavLink> */}

      <NavLink className="navbar__link" to="/products-table">Products Table</NavLink>
      <NavLink className="navbar__link" to="/tictactoe">Tic-Tac-Toe</NavLink>
      {/* <NavLink className="navbar__link" to="/lobby">Lobby</NavLink>
      <NavLink className="navbar__link" to="/frostpunk">Frostpunk 1</NavLink> */}
    </div>
  )
}

export default Navbar
