import { ProtonLazy } from "./ProtonLazy"
import { ProtonList } from "./ProtonList"
import { ProtonShell } from "./ProtonShell"

export * from "./ProtonLazy"
export * from "./ProtonList"
export * from "./ProtonReconciler"
export * from "./ProtonShell"
export * from "./ProtonSwitch"

const Proton = {
  Lazy: ProtonLazy,
  List: ProtonList,
  Shell: ProtonShell,
}
export default Proton
