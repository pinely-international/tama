import "./Navbar.scss"

import Link from "@/app/navigation/Link"


function Navbar(props: { links: { title: string, link: string }[] }) {
  return (
    <nav className="navbar">
      {props.links.map(item => <Link className="navbar__link" to={item.link}>{item.title}</Link>)}
    </nav>
  )
}

export default Navbar
