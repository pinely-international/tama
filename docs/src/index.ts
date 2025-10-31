// import 'prism-themes/themes/prism-ghcolors.css'

import { component, inflator } from "./essential"
import NavbarMobile from "./ui/semantic/Navbar/NavbarMobile"


const inflated = inflator.inflateComponent(component)
const rootElement = document.getElementById("root")!
rootElement.replaceChildren(inflated)

NavbarMobile.makeOverlayFor(rootElement)
