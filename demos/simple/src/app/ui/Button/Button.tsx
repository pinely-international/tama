import { bem } from "@/utils/bem"
import "./Button.scss"

import { Events, Proton } from "@denshya/proton"


interface ButtonProps {
  children: unknown
  color?: string | Events.State<string>

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  const color = Events.State.from(props.color ?? new Events.State(""))
  const className = new Events.State(bem("button", [color.get()]))

  color[Symbol.subscribe](() => {
    className.set(bem("button", [color.get()]))
  })

  return (
    <button type="button" className={className} on={{ click: () => props.onClick?.() }}>{props.children}</button>
  )
}

export default Button
