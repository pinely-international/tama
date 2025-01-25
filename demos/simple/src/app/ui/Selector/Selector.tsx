import "./Selector.scss"

import DropDown, { DropDownOption } from "../DropDown/DropDown"
import Icon, { IconName } from "../Icon/Icon"
import { Proton } from "@denshya/proton"
import { Flow, Flowable } from "@denshya/flow"


interface SelectorProps<T> {
  name?: string
  label?: unknown
  placeholder?: unknown

  iconName?: Flowable<IconName>

  children: JSX.Children<DropDownOption<T>>
}

function Selector<T = string | undefined>(this: Proton.Shell, props: SelectorProps<T>) {
  const expanded = new Flow(false)
  const selected = new Flow<DropDownOption<T> | null>(null)

  this.on("view").subscribe(view => {
    onClickAway(view).subscribe(() => expanded.set(false))
  })

  return (
    <div className="selector">
      {props.label && (
        <div className="selector__label">{props.label}</div>
      )}
      <button className="selector__appearance" type="button" on={{ click: () => expanded.set(it => !it) }}>
        <Icon className="selector__icon" name={Flow.from(props.iconName).required} />
        <div className="selector__placeholder" mounted={selected.isNullish}>{props.placeholder}</div>
        <div className="selector__current">{selected.$.children.required}</div>
        <Icon className="selector__icon" classMods={{ up: expanded }} name="chevron-down" />
      </button>
      <DropDown expanded={expanded} selected={selected}>
        {props.children}
      </DropDown>
    </div>
  )
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
