declare global {
  interface SymbolConstructor {
    readonly dispose: unique symbol
    readonly asyncDispose: unique symbol
    readonly subscribe: unique symbol
  }
}

export { }
