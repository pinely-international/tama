import { Events } from "@denshya/proton"
import { castArray } from "@/utils/common"



// interface SelectorOption<T> {
//   value: T
//   hidden?: boolean
//   disabled?: boolean
// }

interface SelectorControllerConfig<T> {
  /**
   * Force `expanded` state.
   */
  expanded?: boolean | Events.State<boolean>

  value?: Events.State<T | T[]>
  defaultValue?: T | T[]

  /**
   * Allows using search box to filter options.
   *
   * @default
   * true
   */
  searchable?: boolean | Events.State<boolean>
  /**
   * Search will set to this. Read only.
   */
  search?: Events.State<string>
}

class SelectorController<T> {
  constructor(readonly options: T[], readonly config: SelectorControllerConfig<T>) {
    this.search.sets(() => this.expanded.set(true))
    config.search && this.search.sets(config.search)

    if (config.expanded instanceof Events.State) config.expanded.sets(this.expanded)
  }

  readonly search = new Events.State("")
  readonly expanded = new Events.State(false)
  private readonly localSelected = new Events.State<T[]>(castArray(this.config.defaultValue ?? []))

  readonly value = this.config.value?.to(castArray)

  // Allow controlling state from outside.
  readonly selected = this.value ?? this.localSelected
  readonly selectedOptions = this.selected.$.flatMap(selected => this.options.find(option => option === selected) ?? [])

  collapse() {
    this.search.set("")
    this.expanded.set(false)
  }

  filterPredicate(_value: T, children: string): boolean {
    const searchLowerCased = this.search.get().toLowerCase()
    if (children.toLowerCase().includes(searchLowerCased)) {
      return true
    }

    return false
  }

  readonly searchable = Events.State.from(this.config.searchable ?? new Events.State(true))
  readonly searching = this.search.to(it => it.length > 0)
  readonly searchVisible = Events.State.compute(
    [this.searchable, Events.State.from(this.config.expanded ?? this.expanded), this.searching],
    (searchable, expanded, searching) => searchable && (expanded || searching)
  )
}

export default SelectorController
