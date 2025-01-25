import { DropDownOption } from "../DropDown/DropDown"


export interface HeadLessSelectorProps<V> {
  /**
   * Force `expanded` state.
   */
  expanded?: boolean

  value?: V | V[]
  defaultValue?: V | V[]
  onChange?(values: V | V[]): void

  /**
   * Allows to create new element by using search box.
   *
   * @default
   * false
   */
  creatable?: boolean
  /**
   * Triggers on `Create` button click. Takes last value from search box.
   */
  onCreate?(value: string): void | Promise<void>

  /**
   * Allows using search box to filter options.
   *
   * @default
   * true
   */
  searchable?: boolean
  /**
   * Triggers on search value change.
   */
  onSearch?(search: string): void

  children: DropDownOption<V> | DropDownOption<V>[]
}
