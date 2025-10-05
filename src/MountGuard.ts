import { nonGuard, onDemandRef } from "./Inflator/web/helpers"

/** @internal */
export class MountGuard {
  private readonly guards = onDemandRef(() => new Map<string, boolean>())
  public readonly placeholder = onDemandRef(() => document.createComment(this.constructor.name))
  public immediate = false

  constructor(private readonly element: ChildNode) { }

  private toggleMount(condition: unknown) {
    const placeholder = this.placeholder.current

    const source = condition ? placeholder : this.element
    const target = condition ? this.element : placeholder

    if (source?.parentElement == null) return
    source.replaceWith(target)
  }

  for(key: string, property: any) {
    if (property == null) return
    if (typeof property !== "object") return

    if (key === "mounted" && property.valid == null) property.valid = nonGuard

    if (typeof property.valid !== "function") return
    if (!property.subscribe && !property.get) return

    property.subscribe((value: any) => {
      value = property.valueOf() ?? value

      const valid = property.valid(value)
      this.guards.current.set(key, valid)

      this.toggleMount(this.guards.current.values().every(Boolean))
    })

    if (property.valid(property.valueOf()) === false) {
      this.immediate = true
    }
  }
}
