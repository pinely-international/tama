import "./DropDown.scss"

import { Events } from "@denshya/proton"

import { bem } from "@/utils/bem"
import { castArray } from "@/utils/common"


export type DropDownOption<V = unknown> = { type: "option", props: JSX.HTMLElements["option"] & { value?: V }, children: unknown }

interface DropDownProps<V> {
  expanded: Events.State<boolean>
  selected: Events.State<boolean>

  value?: V | V[]

  children: DropDownOption<V> | DropDownOption<V>[]
}

function DropDown<V>(props: DropDownProps<V>) {
  const options = castArray(props.children)
  const optionsIndex = new Events.Index(options)


  function onSelect(option: DropDownOption<V>, index: number) { }

  function dispatchSelection(option: DropDownOption<V>) { }

  function isSelected(option: DropDownOption<V>): boolean {
    return false
  }

  return (
    <div className={props.expanded.to(expanded => bem("drop-down", { expanded }))} role="listbox" aria-expanded={props.expanded}>
      {optionsIndex.map((option, index) => (
        <button
          className={bem("drop-down__option", isSelected(option) && "selected")}
          on={{ click: () => onSelect(option, index) }}
          role="option"
          type="button"

          name={String(option.props.value)}
        >
          {option.props.children}
        </button>
      ))}
    </div>
  )
}

export default DropDown
