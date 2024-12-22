// @ts-expect-error it's ok.
Symbol.subscribe = Symbol.for("subscribe")

import { WebInflator } from "./Inflator"
import Proton from "./Proton"
import Todos from "../demos/Todos/Todos"

Proton

const inflator = new WebInflator


const jsxSampleInflated = inflator.inflate(<Todos />)

const rootElement = document.getElementById("root")!
rootElement.appendChild(jsxSampleInflated)
