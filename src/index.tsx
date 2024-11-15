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




const jsxSample = (
  <div>
    <span on={{}} key="key">Bitch</span>
    {123}
    {new Promise(() => { })}
    <ComponentGod />
  </div>
)



const inflator = new WebInflator
const jsxSampleInflated = inflator.inflate(jsxSample)

const rootElement = document.getElementById("root")!
rootElement.appendChild(jsxSampleInflated)


const componentInflated = inflator.inflate(<ComponentGod />)
setTimeout(() => jsxSampleInflated.appendChild(componentInflated), 1000)

Array(1e3).fill(0).forEach(() => jsxSampleInflated.appendChild(inflator.inflate(<ComponentGod />)))
