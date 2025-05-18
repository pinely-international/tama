import { Window } from "happy-dom"

export function injectDOMPolyfill(context: typeof globalThis) {
  const window = new Window

  for (const key of Object.getOwnPropertyNames(window)) {
    if (key in context) continue

    try {
      // @ts-expect-error ok.
      context[key] = window[key]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // skip
    }
  }

  context.requestAnimationFrame = (callback: (a: number) => void) => { callback(1); return 2 }
}

injectDOMPolyfill(globalThis)
