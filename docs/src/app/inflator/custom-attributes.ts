import { WebInflator } from "@denshya/proton"
import { StateOrPlain } from "@denshya/reactive"

import { bemful } from "@/utils/bem"
import { castArray } from "@/utils/common"


declare global {
  namespace JSX {
    interface CustomAttributes {
      /** Applies modifiers and overrides `className` attribute. */
      classMods?: { [K in keyof never]: StateOrPlain<unknown> } | StateOrPlain<unknown>[]
    }
  }
}

function applyCustomAttributes(inflator: WebInflator) {
  inflator.jsxAttributes.set("classMods", context => {
    if (context.value == null) return

    context.bind("className", bemful(context.props.className as never, ...castArray(context.value)))
  })
}

export default applyCustomAttributes
