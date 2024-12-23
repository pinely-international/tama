import "./DropDown.scss"


import { bem, bemFlow } from "@/utils/bem"
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

function DropDown<T>(this: Proton.Shell, props: DropDownProps<T>) {
  const options = castArray(props.children)
  const optionsIndex = new Proton.Index(options)

  function onSelect(option: DropDownOption<T>, index: number) {
    props.selected.set(option)
    props.expanded.set(false)
  }

  this.use(view => {
    const mutation = new MutationObserver(contain)
    props.expanded.sets(it => {
      if (it === false) return

      contain(view)
    })

    mutation.observe(view, { subtree: true, childList: true, characterData: true })
    return { unsubscribe: () => mutation.disconnect() }
  })

  function contain(view: unknown) {
    containByWidth(view)
    containByHeight(view, document.body)
  }

  return (
    <div className={bemFlow("drop-down", { expanded: props.expanded })} role="listbox" aria-expanded={props.expanded}>
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
