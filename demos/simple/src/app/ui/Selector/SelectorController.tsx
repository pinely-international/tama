
import { Flow, Flowable } from "@denshya/flow"

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
  expanded?: Flowable<boolean>

  value?: Flow<T | T[]>
  defaultValue?: T | T[]

  /**
   * Allows using search box to filter options.
   *
   * @default
   * true
   */
  searchable?: Flowable<boolean>
  /**
   * Search will set to this. Read only.
   */
  search?: Flow<string>
}

class SelectorController<T> {
  constructor(readonly options: T[], readonly config: SelectorControllerConfig<T>) {
    this.search.subscribe(() => this.expanded.set(true))

    if (config.search != null) this.search.sets(config.search)
    if (config.expanded instanceof Flow) config.expanded.sets(this.expanded)
  }

  readonly search = new Flow("")
  readonly expanded = new Flow(false)
  private readonly localSelected = new Flow<T[]>(castArray(this.config.defaultValue ?? []))

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

  readonly searchable = Flow.from(this.config.searchable ?? new Flow(true))
  readonly searching = this.search.to(it => it.length > 0)
  readonly searchVisible = Flow.compute(
    (searchable, expanded, searching) => searchable && (expanded || searching),
    [this.searchable, Flow.from(this.config.expanded ?? this.expanded), this.searching],
  )
}

export default SelectorController
