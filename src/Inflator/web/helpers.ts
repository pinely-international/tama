import WebComponentPlaceholder from "./WebComponentPlaceholder"


export const isNode = (value: unknown) => value instanceof Node
export const nonGuard = (value: unknown) => value


export function disconnectNode(item: unknown) {
  if (item instanceof Node === false) return

  const node = WebComponentPlaceholder.actualOf(item)
  if (node instanceof DocumentFragment) {
    // @ts-expect-error `fixedNodes` is a necessity.
    node.fixedNodes.forEach(disconnectNode)
    return
  }


  node?.parentNode?.removeChild(node)
}

