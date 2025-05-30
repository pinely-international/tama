import { ProtonBehavior as Behavior } from "./ProtonBehavior"
import { ProtonDynamic as Dynamic } from "./ProtonDynamic"
import { ProtonFallback as Fallback } from "./ProtonFallback"
import { ProtonLazy as Lazy } from "./ProtonLazy"
import { ProtonSwitch as Switch } from "./ProtonSwitch"


declare namespace Proton {
  export { Lazy, Dynamic, Switch, Fallback, Behavior }
}

export default Proton
