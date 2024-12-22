import { startCase } from "lodash"

import Enum from "@/utils/tools/enum"
import { EnumType } from "@/utils/types"

import { DropDownOption } from "../DropDown/DropDown"



export function optionsFromArray<T extends unknown[]>(array: T, useStartCase = false): DropDownOption<T>[] {
  return array.map(value => (
    <option value={String(value)} key={String(value)}>{useStartCase ? startCase(String(value)) : String(value)}</option>
  ))
}

/**
 * @param useStartCase - whether or not transform keys to start case (default `false`).
 *
 */
export function optionsFromEntries<T>(entries: [key: string | number, value: string | number][], useStartCase = false): DropDownOption<T>[] {
  return entries.map(([key, value], index) => (
    <option value={value} key={index}>{useStartCase ? startCase(String(key)) : key}</option>
  ))
}

/**
 * @param startCase - whether or not transform keys to start case (default `true`).
 *
 */
export function optionsFromEnum(enumerator: EnumType<never>, startCase = true): DropDownOption[] {
  return optionsFromEntries(Enum.entries(enumerator), startCase)
}


export const TrueFalseOptions = [
  <option value={1} key={1}>True</option>,
  <option value={0} key={0}>False</option>
]
