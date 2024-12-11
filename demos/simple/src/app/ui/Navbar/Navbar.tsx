import "./Navbar.scss"

import { Proton } from "@denshya/proton"
import { Link } from "@/router";


function Navbar() {
  return (
    <div className="navbar">
      <Link className="navbar__link" to="/">Home</Link>
      <Link className="navbar__link" to="/terms">Terms</Link>
      <Link className="navbar__link" to="/contacts">Contacts</Link>
    </div>
  )
}

export default Navbar
