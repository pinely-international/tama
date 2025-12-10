import AppRoot from "./app/AppRoot"
import { inflator } from "./essential"


const inflated = inflator.inflateComponent(AppRoot)
const rootElement = document.getElementById("root")!
rootElement.replaceChildren(inflated)

// NavbarMobile.makeOverlayFor(rootElement)
