import { bem } from "@/utils/bem"
import "./Button.scss"

import { Flow, Flowable } from "@denshya/flow"


interface ButtonProps {
  children: unknown
  color?: Flowable<string>

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  const color = Flow.from(props.color ?? new Flow(""))
  const className = new Flow(bem("button", [color.get()]))

  color[Symbol.subscribe](() => {
    className.set(bem("button", [color.get()]))
  })

  return (
    <button type="button" className={className} on={{ click: () => props.onClick?.() }}>{props.children}</button>
  )
}

export default Button
