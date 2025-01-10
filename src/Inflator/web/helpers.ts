import WebComponentPlaceholder from "./WebComponentPlaceholder"


export const isNode = (value: unknown) => value instanceof Node
export const nonGuard = (value: unknown) => value


export function disconnectInflated(item: unknown) {
  const node = WebComponentPlaceholder.actualOf(item)
  if (node instanceof DocumentFragment) {
    // @ts-expect-error `fixedNodes` is a necessity.
    node.fixedNodes.forEach(disconnectInflated)
    return
  }

  node?.parentNode?.removeChild(node)
}

