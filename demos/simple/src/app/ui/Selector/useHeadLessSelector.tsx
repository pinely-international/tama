import { castArray } from "lodash"
import { useMemo, useRef, useState } from "react"
import { useClickAway, useKeyPressEvent } from "react-use"

import { getReactNodeTextContent } from "@/utils/react"

import { HeadLessSelectorProps } from "./Selector.types"

import { DropDownOption } from "../DropDown/DropDown"


function useHeadLessSelector<V>(props: HeadLessSelectorProps<V>) {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState(false)
  const [localSelected, setSelected] = useState<V[]>(() => castArray(props.defaultValue ?? []))

  const options = useMemo(() => castArray(props.children), [props.children])
  const value = useMemo(() => props.value != null ? castArray(props.value) : null, [props.value])

  // Allow controlling state from outside.
  const selected = useMemo(() => value ?? localSelected, [value, localSelected])
  const selectedOptions = useMemo(() => selected.flatMap(one => options.find(option => option.props.value === one) ?? []), [selected, options])

  function select(newSelected: V[]) {
    setSelected(newSelected)
  }

  function unselect(option: DropDownOption<V>) {
    if (option.props.disabled) return

    const newSelected = selected.filter(one => one !== option.props.value)

    if (props.value != null) {
      props.onChange?.(newSelected)
      return
    }

    setSelected(newSelected)
  }

  function collapse() {
    setSearch("")
    setExpanded(false)
  }

  function onSearch(value: string) {
    props.onSearch?.(value)

    setSearch(value)
    setExpanded(true)
  }

  async function onCreate() {
    await props.onCreate?.(search)
  }

  function filterPredicate(_value: V, children: string): boolean {
    const searchLowerCased = search.toLowerCase()
    if (children.toLowerCase().includes(searchLowerCased)) {
      return true
    }

    return false
  }

  const elementRef = useRef<HTMLDivElement>(null)
  useClickAway(elementRef, collapse)
  useKeyPressEvent("Escape", collapse)

  function shouldCreateOption(): boolean {
    if (search.length <= 0) return false
    const searchLowerCase = search.toLowerCase()

    return !options.some(option => {
      const children = getReactNodeTextContent(option.props.children)
      return children.toLowerCase() === searchLowerCase
    })
  }

  const searchable = props.searchable ?? true
  const searching = search.length > 0
  const searchVisible = searchable && ((props.expanded ?? expanded) || searching)

  const shouldCreate = useMemo(shouldCreateOption, [shouldCreateOption])

  return {
    elementRef,

    expanded: props.expanded ?? expanded,
    setExpanded,
    collapse,

    search,
    searchVisible,
    onSearch,

    shouldCreate,
    onCreate,

    selected,
    selectedOptions,
    select,
    unselect,
    filterPredicate
  }
}

export default useHeadLessSelector
