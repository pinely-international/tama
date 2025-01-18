interface AttributeSetupContext<T> {
  props: Record<string, unknown> & JSX.CustomAttributes & JSX.IntrinsicAttributes

  key: string
  value: T
  element: Element
  /**
   * Sets and updates `element` attribute by `key` when `value` is changed. Discards existing `key` binding.
   */
  bind(key: string, value: unknown): void
}

export type JSXAttributeSetup<T> = (context: AttributeSetupContext<T>) => void

export interface CustomAttributesMap extends Map<string, JSXAttributeSetup<any>> {
  set<T extends keyof JSX.CustomAttributes>(key: T, value: JSXAttributeSetup<JSX.CustomAttributes[T]>): this
}

// class JSXCustomizationAPI {
//   readonly attributes: CustomAttributesMap = new Map<string, JSXAttributeSetup<any>>()
// }

// export default JSXCustomizationAPI
