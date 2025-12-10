export function absoluteOf(element: Element, offsetProperty: (keyof HTMLElement) extends infer S ? S extends `offset${infer P}` ? P : never : never): number {
  if (element instanceof HTMLElement === false) return 0
  return element["offset" + offsetProperty as never] + (element.offsetParent ? absoluteOf(element.offsetParent, offsetProperty) : 0)
}
