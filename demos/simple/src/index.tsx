import { WebInflator } from "@denshya/proton"

import App from "./App"
import { bemFlow } from "./utils/bem"
import { Flowable } from "@denshya/flow"
import { castArray } from "./utils/common"


declare global {
  namespace JSX {
    interface CustomAttributes {
      /** Applies modifiers to `className` */
      classMods?: { [K in keyof never]: Flowable<unknown> } | Flowable<unknown>[]
    }
  }
}

const inflator = new WebInflator
inflator.customAttributes.set("classMods", context => {
  if (context.value == null) return

  context.bind("className", bemFlow(context.props.className as never, ...castArray(context.value)))
})


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
