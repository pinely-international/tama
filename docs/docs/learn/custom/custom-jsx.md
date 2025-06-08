---
sidebar_position: 5
---

# Custom JSX

## Custom Attribute

This extends JSX attributes. It requires three steps to make it work.

1. Declare custom attribute with `jsxAttributes.set`.
2. Bind attribute(s) to the element, this may override intrinsic attributes.
3. Augment `JSX.CustomAttributes` interface to include the custom attribute if you're using TypeScript.

### Real-world Example

```ts
import { WebInflator } from "@denshya/proton"
import { castArray } from "./utils/common"
import { bem } from "./utils/bem"
import { StateOrPlain } from "@denshya/reactive"

declare global {
  namespace JSX {
    interface CustomAttributes {
      /** Applies modifiers based `className` and overrides `className` attribute. */
      classMods?: { [K in keyof never]: StateOrPlain<unknown> } | StateOrPlain<unknown>[]
    }
  }
}

function applyCustomAttributes(inflator: WebInflator) {
  inflator.jsxAttributes.set("classMods", context => {
    if (context.value == null) return

    context.bind("className", bem(context.props.className as never, ...castArray(context.value)))
  })
}

export default applyCustomAttributes

```

## Custom Children

Customization of children can be done using [Inflator Adapters](./custom-inflate.md)

## Custom Provider
