import ProtonJSX from "../ProtonJSX"

function ProtonLazy<T extends JSX.ElementTypeConstructor>(importFactory: () => Promise<{ default: T } | T>) {
  return async () => {
    const module = await importFactory()
    if ("default" in module) return ProtonJSX.Element(module.default, null, null)

    return ProtonJSX.Element(module, null, null)
  }
}

export default ProtonLazy
