import "./Selector.scss"

import DropDown, { DropDownOption } from "../DropDown/DropDown"
import Icon from "../Icon/Icon"
import { Proton } from "@denshya/proton"
import { Flow } from "@denshya/flow"
import { bem } from "@/utils/bem"


interface SelectorProps<T> {
  name?: string
  label?: unknown
  placeholder?: unknown
  createPending?: boolean

  children: DropDownOption<T> | DropDownOption<T>[]
}

function Selector<T = string | undefined>(this: Proton.Shell, props: SelectorProps<T>) {
  const expanded = new Flow(false)
  const selected = new Flow<DropDownOption<T> | null>(null)


  const layout = this.inflator.inflate(
    <div className="selector">
      {props.label && (
        <div className="selector__label">{props.label}</div>
      )}
      <button className="selector__appearance" type="button" on={{ click: () => expanded.set(it => !it) }}>
        <div className="selector__placeholder" mounted={selected.isNullish}>{props.placeholder}</div>
        <div className="selector__current">{selected.to(it => it?.children).required}</div>
        <Icon className={expanded.to(up => bem("selector__icon", { up }))} name="chevron-down" />
      </button>
      <DropDown expanded={expanded} selected={selected}>
        {props.children}
      </DropDown>
    </div>
  )
  onClickAway(layout).subscribe(() => expanded.set(false))

  return layout
}

export default Selector


function onClickAway(view: unknown) {
  return {
    subscribe(next: (event: MouseEvent) => void) {
      const asd = (event: MouseEvent) => {
        if (event.target instanceof Node === false) return

        if (view instanceof Node === false) return
        if (view.contains(event.target)) return

        next(event)
      }

      window.addEventListener("click", asd)
      return { unsubscribe: () => window.removeEventListener("click", asd) }
    }
  }
}
