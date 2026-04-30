import "./DropDown.scss"

import { State, StateArray, StateBoolean } from "@denshya/reactive"
import { MountRoutine, Ref, Tama } from "@denshya/tama"
import { castArray } from "@/utils/common"


export type DropDownOption<V = unknown> = { type: "option", props: JSX.HTMLElements["option"] & { value?: V }, children?: unknown }

interface DropDownProps<T> {
  expanded: State<boolean>
  selected: State<DropDownOption<T> | null>

  children: JSX.Children<DropDownOption<T>>
}

function DropDown<T>(this: Tama.Component, props: DropDownProps<T>) {
  const optionsList = new StateArray(castArray(props.children))

  function onSelect(option: DropDownOption<T>) {
    props.selected.set(option)
    props.expanded.set(false)
  }

  function whenSelected(option: DropDownOption<T>) {
    return props.selected.to(it => it === option || it?.props.value === option?.props.value)
  }

  const ref = new Ref<HTMLDivElement>
  const arrowInputLifecycle = new MountRoutine(signal => {
    window.addEventListener("keydown", event => {

    }, { signal })
  })

  props.expanded.subscribe(() => contain(ref.current!))
  props.expanded.subscribe(expanded => {
    if (!expanded) return
    scrollIntoView(ref.current!, props.selected.current?.props.value)
  })
  props.expanded.subscribe(expanded => {
    if (expanded === true) arrowInputLifecycle.enter()
    if (expanded === false) arrowInputLifecycle.exit()
  })


  return (
    <div className="drop-down" classMods={{ expanded: props.expanded }} ref={ref} aria={{ role: "listbox", ariaExpanded: props.expanded }}>
      {optionsList.map(option => (
        <button
          className="drop-down__option"
          classMods={{ selected: whenSelected(option) }}

          on={{ click: () => onSelect(option) }}
          aria={{ role: "option" }}
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

function contain(view: HTMLElement) {
  containByWidth(view)
  containByHeight(view, document.body)
}

function containByWidth(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const maxVisibleWidth = window.innerWidth - rect.x

  // Disable wrapping for nicer transition and accurate measurement.
  element.style.setProperty("text-wrap", "nowrap")
  element.style.setProperty("justify-items", "start")
  element.style.setProperty("justify-content", "start")

  element.style.removeProperty("--max-option-width")
  element.style.removeProperty("--max-visible-width")

  const maxOptionWidth = Math.max(...[...element.children].map(child => child.scrollWidth))
  if (maxOptionWidth > maxVisibleWidth) {
    // Allow wrapping when it's impossible to see.
    element.style.removeProperty("text-wrap")
  }
  element.style.removeProperty("justify-items")
  element.style.removeProperty("justify-content")

  element.style.setProperty("--max-option-width", maxOptionWidth.toString())
  element.style.setProperty("--max-visible-width", maxVisibleWidth.toString())
}

function containByHeight(element: HTMLElement, scrollingElement: HTMLElement) {
  const parent = element.parentElement
  if (parent == null) {
    throw new TypeError("`DropDown` parent can't be null")
  }

  element.style.removeProperty("max-height")
  element.classList.remove("drop-down--upwards")

  const rect = element.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  const scrollingRect = scrollingElement.getBoundingClientRect()

  const elementBottom = rect.height + parentRect.bottom
  // Do nothing if it already fits entirely to the viewport.
  if (elementBottom <= scrollingRect.bottom) return

  // Caps height to top of the viewport and directs DropDown upwards.
  if ((parentRect.bottom - scrollingRect.top) > (scrollingRect.height / 2)) {
    element.style.setProperty("max-height", `calc(${parentRect.top - scrollingRect.top}px - 1em)`)
    element.classList.add("drop-down--upwards")

    return
  }

  // Caps height to bottom of the viewport.
  element.style.setProperty("max-height", `calc(${scrollingRect.bottom - parentRect.bottom}px - 1em)`)
}

/**
 * https://jsfiddle.net/cxe73c22/
 */
function scrollIntoView(container: HTMLElement, value: unknown) {
  const containerRect = container.getBoundingClientRect()

  const choiceElement = container.children.namedItem(String(value))
  const choiceElementRect = choiceElement?.getBoundingClientRect()
  if (choiceElementRect == null) return

  const offsetTop = choiceElementRect.top - containerRect.top
  const middle = offsetTop - (containerRect.height / 2) + (choiceElementRect.height / 2)

  container.scrollBy(0, middle)
}

function loop(number: number, max: number): number {
  if (number > max) return 0
  if (number < 0) return max

  return number
}

function focusOption(container: HTMLElement, optionIndex: number) {
  const choiceElement = container.children.item(optionIndex)
  if (!(choiceElement instanceof HTMLElement)) return

  choiceElement.focus()
}
