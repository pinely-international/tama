import { Flowable } from "@denshya/flow"
import { WebInflator } from "@denshya/proton"

import { bemFlow } from "./utils/bem"
import { castArray } from "./utils/common"

declare global {
  namespace JSX {
    interface CustomAttributes {
      /** Applies modifiers based `className` and overrides `className` attribute. */
      classMods?: { [K in keyof never]: Flowable<unknown> } | Flowable<unknown>[]
    }
  }
}

function applyCustomAttributes(inflator: WebInflator) {
  inflator.jsxAttributes.set("classMods", context => {
    if (context.value == null) return

    context.bind("className", bemFlow(context.props.className as never, ...castArray(context.value)))
  })
}

export default applyCustomAttributes
