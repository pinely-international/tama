import "./Navbar.scss"

import { Proton } from "@denshya/proton"


function Navbar(this: Proton.Shell) {
  this.view.set(
    <div className="navbar">
      <a className="navbar__link">Home</a>
      <a className="navbar__link">Terms</a>
      <a className="navbar__link">Contacts</a>
    </div>
  )
}

export default Navbar
