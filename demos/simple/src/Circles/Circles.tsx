import "./Circles.scss"

import { Flow } from "@denshya/flow"
import { Proton } from "@denshya/proton"



function Row(this: Proton.Shell, props: { i: number, count: Flow<number> }) {
  // const top = Act.compute(count => `${Math.sin(count / 10) * 10}px`, [props.count])
  // const left = Act.compute(count => `${Math.cos(count / 10) * 10}px`, [props.count])
  // const background = Act.compute(count => `rgb(0,0,${count % 255})`, [props.count])

  // const top = (`${Math.sin(+props.count / 10) * 10}px`)
  // const left = (`${Math.cos(+props.count / 10) * 10}px`)
  // const background = (`rgb(0,0,${+props.count % 255})`)

  const top = props.count.to(count => `${Math.sin(count / 10) * 10}px`)
  const left = props.count.to(count => `${Math.cos(count / 10) * 10}px`)
  const background = props.count.to(count => `rgb(0,0,${count % 255})`)
  // const background = props.count.in`rgb(0,0,${+props.count.it % 255})`

  this.view.set(
    <div className="box-view">
      <div className="box" style={{ top, left, background }}>{props.count}</div>
    </div>
  )
}

function Circles(this: Proton.Shell) {
  const count = new Flow(0)
  const timing = new Flow("")

  let loopTime = 0
  let loopCount = 0
  let totalTime = 0


  function loop() {
    const lastLoopTime = loopTime || performance.now()
    loopTime = performance.now()
    loopCount++

    Promise.resolve().then(() => count.set(it => (it + 1) % 63))

    totalTime = totalTime + loopTime - lastLoopTime
    if (loopCount % 30 === 0)
      timing.set(`Performed ${loopCount} iterations in ${totalTime.toFixed(2)} ms (average ${(totalTime / loopCount).toFixed(6)} ms per loop).`)

    setTimeout(loop, 0)
  }

  loop()

  const grid = this.inflator.inflate(<div className="boxes-grid" />)

  Array(300)
    .fill(0)
    .forEach((_, i) => grid.appendChild(this.inflator.inflate(<Row i={i} count={count} />)))

  this.view.set(
    <div>
      {timing}
      {grid}
    </div>
  )
}

export default Circles
