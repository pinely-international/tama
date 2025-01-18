interface JSXCustomizationContext {
  element: Element
}

export type JSXAttributeSetup<T> = (value: T, context: JSXCustomizationContext) => void

export interface CustomAttributesMap extends Map<string, JSXAttributeSetup<any>> {
  set<T extends keyof JSX.CustomAttributes>(key: T, value: JSXAttributeSetup<JSX.CustomAttributes[T]>): this
}

// class JSXCustomizationAPI {
//   readonly attributes: CustomAttributesMap = new Map<string, JSXAttributeSetup<any>>()
// }

// export default JSXCustomizationAPI
