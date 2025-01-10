import { WebInflator, Proton } from "@denshya/proton"

import App from "./App"

// class LazyModuleWebInflator {
//   constructor(protected readonly inflator: Inflator) { }

//   inflate(value: unknown) {
//     if (value instanceof Promise === false) return
//     console.log(this.inflator)

//     const placeholder = new Comment("Promise Placeholder")
//     value.then(value => {
//       placeholder.replaceWith(this.inflator.inflate(value))
//     })

//     return placeholder
//   }
// }

const inflator = new WebInflator
inflator.adapters.add(Proton.ListWebInflator)

const inflated = inflator.inflate(<App />)

document.getElementById("root")!.appendChild(inflated)

// Conditional ESM module loading (Node.js and browser)
// @ts-ignore: Property 'UrlPattern' does not exist
if (!globalThis.URLPattern) {
  await import("urlpattern-polyfill");
}
/**
 * The above is the recommended way to load the ESM module, as it only
 * loads it on demand, thus when not natively supported by the runtime or
 * already polyfilled.
 */
import "urlpattern-polyfill";

/**
 * In case you want to replace an existing implementation with the polyfill:
 */
import { URLPattern } from "urlpattern-polyfill";
globalThis.URLPattern = URLPattern


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
