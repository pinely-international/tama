import ProtonDynamic from "./ProtonDynamic"
import { ProtonLazy } from "./ProtonLazy"
import { ProtonList, ProtonListWebInflator } from "./ProtonList"
import { ProtonShell } from "./ProtonShell"

const Proton = {
  Lazy: ProtonLazy,
  Dynamic: ProtonDynamic,
  Shell: ProtonShell,
  List: ProtonList,
  ListWebInflator: ProtonListWebInflator,
}
export default Proton
