declare global {
  interface SymbolConstructor {
    readonly dispose: unique symbol
    readonly asyncDispose: unique symbol
    readonly subscribe: unique symbol

    readonly overload: unique symbol
    readonly observable: unique symbol
    readonly concat: unique symbol
    readonly shorthand: unique symbol
    /**
     * Reveals underlying data in its current form.
     */
    readonly reveal: unique symbol
  }
}

export { }
