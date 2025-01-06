declare global {
  namespace JSX {
    interface ElementTypeConstructor {

      (this: never, props: any): unknown | Promise<unknown>
    }
  }
}


export { default as Shell } from "./ProtonShell"
export { default as Lazy } from "./ProtonLazy"
export { default as List } from "./ProtonList"
// export { default as Reconciler } from "./ProtonReconciler"
export { default as Switch } from "./ProtonSwitch"
