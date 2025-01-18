import { WebInflator } from "@denshya/proton"
import { castArray } from "./utils/common"
import { bemFlow } from "./utils/bem"
import { Flowable } from "@denshya/flow"

declare global {
  namespace JSX {
    interface CustomAttributes {
      /** Applies modifiers based `className` and overrides `className` attribute. */
      classMods?: { [K in keyof never]: Flowable<unknown> } | Flowable<unknown>[]
    }
  }
}

function applyCustomAttributes(inflator: WebInflator) {
  inflator.customAttributes.set("classMods", context => {
    if (context.value == null) return

    context.bind("className", bemFlow(context.props.className as never, ...castArray(context.value)))
  })
}

export default applyCustomAttributes
