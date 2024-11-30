import { Proton, WebInflator } from "@denshya/proton"

import App from "./App"

Proton

const inflator = new WebInflator
const inflated = inflator.inflate(<App />)

document.getElementById("root")!.appendChild(inflated)
