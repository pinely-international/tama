import "./Selector.scss"

import { ReactNode, useRef } from "react"
import { LoaderIcon } from "react-hot-toast"

import { classWithModifiers } from "@/utils/bem"
import { inputValue } from "@/utils/react"

import { HeadLessSelectorProps } from "./Selector.types"
import useHeadLessSelector from "./useHeadLessSelector"

import Button from "../Button/Button"
import DropDown from "../DropDown/DropDown"
import Icon from "../Icon/Icon"


interface SelectorProps<V> extends HeadLessSelectorProps<V> {
  name?: string
  label?: ReactNode
  placeholder?: string
  createPending?: boolean
}

function Selector<V = string | undefined>(props: SelectorProps<V>) {
  const {
    elementRef,

    expanded,
    setExpanded,
    collapse,

    selected,
    selectedOptions,
    filterPredicate,
    select,

    search,
    searchVisible,
    onSearch,

    shouldCreate,
    onCreate
  } = useHeadLessSelector(props)

  const createButton = (
    <Button size="smaller" color="white" disabled={props.createPending} await onClick={onCreate}>
      {`Create "${search}"`}
      {props.createPending && <LoaderIcon />}
    </Button>
  )

  const searchRef = useRef<HTMLInputElement>(null)

  function onClick() {
    setExpanded(true)
    searchRef.current?.focus()
  }

  function onSelect(values: V[]) {
    select(values)
    collapse()

    props.onChange?.(values[0])
  }

  return (
    <div className="selector" ref={elementRef}>
      {props.label && (
        <div className="selector__label">{props.label}</div>
      )}
      <button className={classWithModifiers("selector__appearance", expanded && "expanded")} type="button" onClick={onClick}>
        {selectedOptions.length <= 0 && (
          <div className="selector__placeholder">{props.placeholder}</div>
        )}
        {selectedOptions.length >= 1 && (
          <div className="selector__current">{selectedOptions[0]?.props.children}</div>
        )}
        {searchVisible && (
          <input className="selector__search" autoFocus value={search} onChange={inputValue(onSearch)} />
        )}
        {!props.expanded && (
          <Icon className={classWithModifiers("selector__icon", expanded && "up")} name="chevron-down" />
        )}
      </button>
      <DropDown
        defaultValue={props.defaultValue}

        expanded={expanded}
        onSelect={onSelect}
        value={selected}


        filterPredicate={search.length > 0 ? filterPredicate : undefined}
        bottom={props.creatable && shouldCreate && createButton}
      >
        {props.children}
      </DropDown>
      {props.name && (
        <input type="hidden" name={props.name} value={selected.map(String)} />
      )}
    </div>
  )
}

export default Selector
