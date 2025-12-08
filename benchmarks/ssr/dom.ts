import { Window } from "happy-dom"




export function injectDOMPolyfill(context: typeof globalThis) {
  const window = new Window({
    width: 1300,
    height: 1080,

    url: "http://localhost:5000",
    settings: {
      disableComputedStyleRendering: false,
      disableCSSFileLoading: true,
      // disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: false,
      handleDisabledFileLoadingAsSuccess: true,
    }
  })

  // Resolve CSS files to "load".
  const originalAddEventListener = window.HTMLLinkElement.prototype.addEventListener
  window.HTMLLinkElement.prototype.addEventListener = function (type, listener, options) {
    if (type === "load") return listener.call(this)
    return originalAddEventListener.call(this, type, listener, options)
  }

  for (const key of Object.getOwnPropertyNames(window)) {
    if (key in context) continue

    try {
      context[key] = window[key]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // skip
    }
  }

  context.requestAnimationFrame = (callback: (a: number) => void) => { callback(1); return 2 }
  context.requestIdleCallback = () => { return 2 }
}

injectDOMPolyfill(globalThis)
