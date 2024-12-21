import { WebInflator } from "@denshya/proton"

// import App from "./App"

const inflator = new WebInflator
const inflated = inflator.inflate(<p className="asd">123</p>)
console.log(<p className="asd">123</p>)

document.getElementById("root")!.appendChild(inflated)
