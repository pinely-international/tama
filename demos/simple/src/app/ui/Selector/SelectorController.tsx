import { State, StateOrPlain } from "@denshya/reactive"

import { castArray } from "@/utils/common"


interface SelectorControllerConfig<T> {
  /**
   * Force `expanded` state.
   */
  expanded?: StateOrPlain<boolean>

  value?: State<T | T[]>
  defaultValue?: T | T[]

  /**
   * Allows using search box to filter options.
   *
   * @default
   * true
   */
  searchable?: StateOrPlain<boolean>
  /**
   * Search will set to this. Read only.
   */
  search?: State<string>
}

class SelectorController<T> {
  constructor(readonly options: T[], readonly config: SelectorControllerConfig<T>) {
    this.search.subscribe(() => this.expanded.set(true))

    if (config.search != null) this.search.sets(config.search)
    if (config.expanded instanceof State) config.expanded.sets(this.expanded)
  }

  readonly search = new State("")
  readonly expanded = new State(false)
  private readonly localSelected = new State<T[]>(castArray(this.config.defaultValue ?? []))

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

  readonly searchable = State.from(this.config.searchable ?? true)
  readonly searching = this.search.to(it => it.length > 0)
  readonly searchVisible = State.combine(
    [this.searchable, this.config.expanded ?? this.expanded, this.searching],
    (searchable, expanded, searching) => searchable && (expanded || searching),
  )
}

export default SelectorController
