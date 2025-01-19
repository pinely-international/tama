import "./polyfills"
import "./error-overlay"

import { WebInflator } from "@denshya/proton"

import App from "./App"
import applyCustomAttributes from "./custom-attributes"


const inflator = new WebInflator
applyCustomAttributes(inflator)


const inflated = inflator.inflate(<App />)
document.getElementById("root")!.replaceChildren(inflated)
