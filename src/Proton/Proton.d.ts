import { ProtonDynamic as Dynamic } from "./ProtonDynamic"
import { ProtonLazy as Lazy } from "./ProtonLazy"
import { ProtonList as List, ProtonListWebInflator as ListWebInflator } from "./ProtonList"
import { ProtonShell as Shell } from "./ProtonShell"


declare namespace Proton {
  export { Lazy, Dynamic, List, Shell, ListWebInflator }
}

export default Proton
