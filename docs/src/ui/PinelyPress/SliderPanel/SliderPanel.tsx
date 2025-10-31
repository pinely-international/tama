import "./SliderPanel.scss"

import { State } from "@denshya/reactive"

import Button from "@/ui/kit/Button/Button"
import Icon from "@/ui/static/Icon/Icon"


interface SliderPanelProps {
  children: JSX.Element[] | JSX.Element
}


function SliderPanel(props: SliderPanelProps) {
  const children = props.children instanceof Array ? props.children : props.children.props.children.filter(x => x instanceof Object) as never
  const pointer = new CircularPointer(children.length)

  return (
    <div className="slider-panel" style={{ "--pointer": pointer.index }}>
      <div className="slider-panel__container">
        {props.children}
      </div>

      <div className="slider-panel__controls">
        <Button color="white" onClick={() => pointer.previous()}><Icon name="chevron-left" /></Button>
        <Button color="white" onClick={() => pointer.next()}><Icon name="chevron-right" /></Button>
      </div>
    </div>
  )
}

export default SliderPanel



class CircularPointer {
  readonly index = new State(0)

  constructor(readonly max: number) { }

  next() {
    this.index.set(x => {
      if (x >= this.max - 1) return 0
      return x + 1
    })
  }
  previous() {
    this.index.set(x => {
      if (x <= 0) return this.max - 1
      return x - 1
    })
  }
}
