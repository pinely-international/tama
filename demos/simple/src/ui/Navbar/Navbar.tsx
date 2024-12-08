import { router } from "@/router";
import "./Navbar.scss"

import { Proton } from "@denshya/proton"


function Navbar(this: Proton.Shell) {
  console.log(<Link className="navbar__link" to="/">Home</Link>)

  this.view.set(
    <div className="navbar">
      <Link className="navbar__link" to="/">Home</Link>
      <Link className="navbar__link" to="/terms">Terms</Link>
      <Link className="navbar__link" to="/contacts">Contacts</Link>
    </div>
  )
}

export default Navbar


function Link(this: Proton.Shell, props: { to: string; className?: string; children?: unknown }) {
  function onClick(event: MouseEvent) {
    event.preventDefault()
    router.navigate(props.to)
  }

  this.view.set(<a className={props.className} href={props.to} on={{ click: onClick }}>{props.children}</a>)
}
