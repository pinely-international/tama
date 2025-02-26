import Act from "../src/Act"
import ActBindings from "../src/ActBinding"
import Events from "../src/Events"
import { WebInflator } from "../src/Inflator"
import Proton from "../src/Proton"


const inflator = new WebInflator


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


function ComponentGod(this: Proton.Component) {
  this.view.set(<>Component Initiated</>)

  let i = 0

  setTimeout(() => {
    this.view.set(<>Scheduled update </>)

    everySecond(() => {
      i += Date.now()
      this.view.set(<>Scheduled update: {i} <DisposableState /></>)
    })
  }, 1000)
}

function DisposableState() {
  new Events.State("")[Symbol.subscribe](() => { })
}


const counter = new Events.State(0)
setTimeout(() => setInterval(() => counter.set(it => it + 1)), 1000)


async function Circle(this: Proton.Component & { counter: number }, props: { offset?: string }) {
  const left = Act.compute(counter => `calc(${(counter / 8)}px + ${props.offset})`, [counter])
  // alert(left.get())
  // const left = Act.string`calc(${counter} / 8px + ${props.offset})`

  const tree = (
    <div style={{ top: props.offset, left, position: "absolute", padding: "2em", background: "skyblue", borderRadius: "50%", display: "grid" }}>
      Wow ?
      <span> {counter}<span>2: {counter}</span></span>
      <ComponentGod />
    </div>
  )
  const treeInflated = inflator.inflate(tree) as HTMLElement



  const colorState = new Events.State(0)
  const [color, setColor] = colorState as unknown as typeof colorState._Tuple

  setInterval(() => setColor(f => f > 255 ? 0 : (f + 0.1)))

  Act.on([color], () => treeInflated.style.backgroundColor = `hsl(${color()} 50% 50%)`)

  // this.act.accessor("counter", counter)
  // this.define("counter", counter)
  // this.act.define({ counter })
  // this.define({ counter })

  // Object.defineProperty(this, "counter", counter[Symbol.for("descriptor")]())
  // Act.define(this, { counter })

  // setInterval(() => this.counter++)

  this.view.set(treeInflated)
}


// class ClassComponent extends Proton.Component {
//   constructor(inflator: Inflator) {
//     super(inflator)

//     this.tree.set(<div>ClassComponent</div>)
//   }
// }


const jsxSample = (
  <div>
    <span on={{}} key="key">Bitch</span>
    {123}
    {new Promise(() => { })}
    <ComponentGod />

    <Circle offset="0em" />
    <Circle offset="5em" />
    <Circle offset="10em" />
    <Circle offset="15em" />
    <Circle offset="20em" />
    <Circle offset="25em" />
    {/* <ClassComponent /> */}
  </div>
)




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
