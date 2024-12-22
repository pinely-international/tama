import "./DropDown.scss"


import { bem } from "@/utils/bem"
import { castArray } from "@/utils/common"
import { Flow } from "@denshya/flow"
import { Proton } from "@denshya/proton"


export type DropDownOption<V = unknown> = { type: "option", props: JSX.HTMLElements["option"] & { value?: V }, children: unknown }

interface DropDownProps<T> {
  expanded: Flow<boolean>
  selected: Flow<DropDownOption<T> | null>

  value?: T | T[]

  children: DropDownOption<T> | DropDownOption<T>[]
}

function DropDown<T>(props: DropDownProps<T>) {
  const options = castArray(props.children)
  const optionsIndex = new Proton.Index(options)


  function onSelect(option: DropDownOption<T>, index: number) {
    props.selected.set(option)
    props.expanded.set(false)
  }

  function dispatchSelection(option: DropDownOption<T>) { }

  function isSelected(option: DropDownOption<T>): boolean {
    return false
  }

  return (
    <div className={props.expanded.to(expanded => bem("drop-down", { expanded }))} role="listbox" aria-expanded={props.expanded}>
      {optionsIndex.map((option, index) => (
        <button
          className={props.selected.to(it => bem("drop-down__option", { selected: it === option }))}
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
