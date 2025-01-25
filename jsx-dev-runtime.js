export { Fragment, jsx } from "./build/jsx-runtime"

export function jsxDEV(type, props, children, isStaticChildren, source, self) {
  return jsx(type, props, children)
}
