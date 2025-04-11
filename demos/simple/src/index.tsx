import "./polyfills"
import "./error-overlay"

import { WebInflator } from "@denshya/proton"

import App from "./App"
import applyCustomAttributes from "./custom-attributes"


const inflator = new WebInflator
inflator.flags.debug = true
applyCustomAttributes(inflator)


const inflated = inflator.inflate(<App />)
document.getElementById("root")!.replaceChildren(inflated)


function resolveReplacement(value: any): any {
  const seen = new Set()
  while (value?.replacedWith) {
    if (seen.has(value)) return value
    seen.add(value)
    value = value.replacedWith
  }
  return value
}
