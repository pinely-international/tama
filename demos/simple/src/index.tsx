import { WebInflator } from "@denshya/proton"

import App from "./App"
import { bemFlow } from "./utils/bem"
import { Flowable } from "@denshya/flow"


declare global {
  namespace JSX {
    interface CustomAttributes {
      classMods?: Record<keyof never, Flowable<unknown>>
    }
  }
}

const inflator = new WebInflator
inflator.customAttributes.set("classMods", context => context.bind("className", bemFlow(...context.value)))


const inflated = inflator.inflate(<App />)

document.getElementById("root")!.replaceChildren(inflated)

// Conditional ESM module loading (Node.js and browser)
// @ts-ignore: Property 'UrlPattern' does not exist
if (!globalThis.URLPattern) {
  await import("urlpattern-polyfill");
}


if (import.meta.env.DEV) {
  // REGISTER ERROR OVERLAY
  const showErrorOverlay = (err: unknown) => {
    // must be within function call because that's when the element is defined for sure.
    const ErrorOverlay = customElements.get('vite-error-overlay')
    // don't open outside vite environment
    if (!ErrorOverlay) { return }
    console.log(err)
    const overlay = new ErrorOverlay(err)
    document.body.appendChild(overlay)
  }

  window.addEventListener('error', showErrorOverlay)
  window.addEventListener('unhandledrejection', ({ reason }) => showErrorOverlay(reason))
}
