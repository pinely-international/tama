// @ts-expect-error it's ok.
Symbol.subscribe = Symbol.for("subscribe")

import Act from "./Act"
import Events from "./Events"
import { WebInflator } from "./Inflator"
import Proton from "./Proton"

export { Proton, Events, Act, WebInflator }
