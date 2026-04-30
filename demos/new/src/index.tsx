import "./styles.css"

import { WebInflator } from "@denshya/tama"

import App from "./App"

const inflator = new WebInflator
const root = document.getElementById("root")

root?.replaceChildren(inflator.inflate(<App />))