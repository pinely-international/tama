import JSXVirtual from "../jsx/JSXVirtual"

export function ProtonLazy<T extends JSX.ElementTypeConstructor>(importFactory: () => Promise<{ default: T } | T>) {
  return async () => {
    const module = await importFactory()
    if ("default" in module) return JSXVirtual.Element(module.default, null, null)

    return JSXVirtual.Element(module, null, null)
  }
}
