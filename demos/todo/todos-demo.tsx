// @ts-expect-error it's ok.
Symbol.subscribe = Symbol.for("subscribe")

import Todos from "./Todos/Todos"

import { WebInflator } from "../../src/Inflator"
import Proton from "../../src/Proton"

Proton

const inflator = new WebInflator


const jsxSampleInflated = inflator.inflate(<Todos />)

const rootElement = document.getElementById("root")!
rootElement.appendChild(jsxSampleInflated)
