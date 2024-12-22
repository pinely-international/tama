import "./Selector.scss"

import DropDown, { DropDownOption } from "../DropDown/DropDown"
import Icon from "../Icon/Icon"
import { Events, Proton } from "@denshya/proton"


interface SelectorProps<V> {
  name?: string
  label?: unknown
  placeholder?: string
  createPending?: boolean

  children: DropDownOption<V> | DropDownOption<V>[]
}

function Selector<V = string | undefined>(this: Proton.Shell, props: SelectorProps<V>) {
  const expanded = new Events.State(false)
  const selected = new Events.State([])


  const layout = this.inflator.inflate(
    <div className="selector">
      {props.label && (
        <div className="selector__label">{props.label}</div>
      )}
      <button className="selector__appearance" type="button" on={{ click: () => expanded.set(it => !it) }}>
        <div className="selector__placeholder">{props.placeholder}</div>
        <Icon className="selector__icon" name="chevron-down" />
      </button>
      <DropDown expanded={expanded}>
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
