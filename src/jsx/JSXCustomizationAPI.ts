interface AttributeSetupContext<T> {
  key: string
  value: T
  element: Element
  /** Sets `value` to `element` attribute by `key`. */
  set(key: string, value: unknown): void
  /**
   * Extends `set` method. If observable, updates `element` attribute by `key` when `value` is changed.
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
