import { JSXAttributeSetup } from "@/jsx/JSXCustomizationAPI"
import TreeContextAPI from "@/TreeContextAPI"

import { ProtonFallback } from "./ProtonFallback"




export abstract class ProtonBehavior<Props = unknown> {
  declare readonly props: Props & JSX.GenericAttributes
  declare readonly context: TreeContextAPI

  /**
   * There are three states of a component:
   * 1. Errored - error happened during component factory evaluation.
   * 2. Pending - await for async operation or component suspense was triggered.
   * 3. Normal flow.
   */
  readonly fallback?: ProtonFallback<any>

  onEnter?(): void | Promise<void>
  onExit?(): void | Promise<void>
}

export const ProtonBehaviorAttributeSetup: JSXAttributeSetup<ProtonBehavior> = context => {
  if (context.component == null) return
  if (context.value instanceof ProtonBehavior === false) return

  const { component, value: behavior } = context

  // @ts-expect-error `props` is readonly.
  behavior.props = context.props
  // @ts-expect-error `context` is readonly.
  behavior.context = component.context

  if (behavior.onEnter) component.events.when("mount").subscribe(() => behavior.onEnter!())
  if (behavior.onExit) component.events.when("unmount").subscribe(() => behavior.onExit!())

  if (behavior.fallback != null) {
    component.catch(error => {
      if (error instanceof Error === false) return

      behavior.fallback!.error.set(error)
      component.events.when("view").subscribe(() => behavior.fallback!.error.set(null), { once: true })
    })
    component.events.when("suspend")
  }
}
