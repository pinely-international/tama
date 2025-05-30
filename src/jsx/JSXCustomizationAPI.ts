import { ProtonComponent } from "@/Proton/ProtonComponent"

export interface AttributeSetupContext<T> {
  /** @internal */
  component?: ProtonComponent

  props: JSX.GenericAttributes
  key: string
  value: T

  /**
   * Sets and updates `element` attribute by `key` when `value` is changed. Discards existing `key` binding.
   */
  bind(key: string, value: unknown): void
}

export type JSXAttributeSetup<T> = (context: AttributeSetupContext<T>) => void

export interface CustomAttributesMap extends Map<string, JSXAttributeSetup<any>> {
  set<T extends keyof JSX.CustomAttributes>(key: T, value: JSXAttributeSetup<JSX.CustomAttributes[T]>): this
}
