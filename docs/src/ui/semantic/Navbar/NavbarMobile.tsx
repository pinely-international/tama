import { StateBoolean } from "@denshya/reactive"

import Link from "@/app/navigation/Link"
import { inflator } from "@/essential"
import Button from "@/ui/kit/Button/Button"
import Icon from "@/ui/static/Icon/Icon"


namespace NavbarMobile {
  const expanded = new StateBoolean(false)



  function Container(props: { links: { title: string, link: string }[] }) {
    return (
      <nav className="mobile-navbar" mounted={expanded}>
        {props.links.map(item => (
          <Link className="navbar__link" to={item.link}>{item.title}</Link>
        ))}
        <hr />
        <Link className="navbar__link" to="/privacy">Privacy Policy</Link>
        <Link className="navbar__link" to="/terms">Terms & Conditions</Link>
        <Link className="navbar__link" to="/cookies">Cookie Policy</Link>
      </nav>
    )
  }

  export function ToggleButton() {
    return (
      <Button color="white" onClick={() => expanded.toggle()}><Icon name="book-read" /> Menu</Button>
    )
  }

  export function makeOverlayFor(app: HTMLElement) {
    const containerElement = inflator.inflate(<Container links={[]} />)
    const mobileNavbarCover = inflator.inflate(
      <aside className="mobile-navbar__cover" on={{ click: () => expanded.set(false) }}>
        <div className="mobile-navbar__cover-info">
          <Icon name="touch" />
          <span>Click to expand</span>
        </div>
      </aside>
    )


    app.before(containerElement)

    app.style.borderRadius = "1em"
    app.style.boxShadow = "-4px 0 12px -4px rgba(0,0,0,0.25)"
    app.style.transition = "500ms ease transform"

    document.body.style.background = "#f8edff"

    expanded.subscribe(expanded => {
      if (expanded) {
        app.style.overflow = "hidden"
        app.style.transform = "translate(15em, 2em)"
        app.append(mobileNavbarCover)

        document.body.style.overflow = "hidden"
        document.body.parentElement!.style.overflow = "hidden"
      } else {
        app.style.overflow = ""
        app.style.transform = ""
        mobileNavbarCover.remove()

        document.body.style.overflow = ""
        document.body.parentElement!.style.overflow = ""
      }
    })
  }
}

export default NavbarMobile
