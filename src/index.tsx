// @ts-expect-error it's ok.
Symbol.subscribe = Symbol.for("subscribe")

import Act from "./Act"
import ActBindings from "./ActBinding"
import Events from "./Events"
import { WebInflator } from "./Inflator"
import Proton from "./Proton"





const everySecondCallbacks = new Set<() => void>
setInterval(() => {
  for (const callback of everySecondCallbacks) queueMicrotask(callback)
}, 1000)

function everySecond(callback: () => void): () => void {
  everySecondCallbacks.add(callback)

  return () => {
    everySecondCallbacks.delete(callback)
  }
}


function ComponentGod(this: Proton.Shell) {
  this.tree.set(<>Component Initiated</>)

  let i = 0

  setTimeout(() => {
    this.tree.set(<>Scheduled update</>)

    everySecond(() => {
      i += Date.now()
      this.tree.set(<>Scheduled update: {i}</>)
    })
  }, 1000)

  return this
}


function BlueCircle(this: Proton.Shell) {
  const counter = new Events.State(0)
  const left = Act.compute(value => (value / 8) + "px", counter)

  Object.defineProperty(this, "counter", counter[Symbol.for("descriptor")]())

  setInterval(() => this.counter++)

  this.tree.set(
    <div style={{ left, position: "absolute", padding: "2em", background: "skyblue", borderRadius: "50%" }}>
      <span>{counter}</span>
    </div>
  )


  return this
}


const jsxSample = (
  <div>
    <span on={{}} key="key">Bitch</span>
    {123}
    {new Promise(() => { })}
    <ComponentGod />

    <BlueCircle />
  </div>
)



const inflator = new WebInflator
const jsxSampleInflated = inflator.inflate(jsxSample)

const rootElement = document.getElementById("root")!
rootElement.appendChild(jsxSampleInflated)


const componentInflated = inflator.inflate(<ComponentGod />)
setTimeout(() => jsxSampleInflated.appendChild(componentInflated), 1000)

Array(1e2).fill(0).forEach(() => jsxSampleInflated.appendChild(inflator.inflate(<ComponentGod />)))








//#region Act Binding

const element = document.createElement("div")
element.style.position = "absolute"
element.style.bottom = "10vh"
element.style.width = "2em"
element.style.padding = "2em"
element.style.background = "skyblue"
document.body.appendChild(element)

const props = {
  left: {
    i: 0,
    [Symbol.subscribe](next: (value: string) => void) {
      const interval = setInterval(() => {
        this.i++
        next(this.i / 8 + "px")
      })
      return () => clearInterval(interval)
    }
  }
}

const actBindings = new ActBindings(element.style)
actBindings.set(props, "left")

//#endregion Act Binding
