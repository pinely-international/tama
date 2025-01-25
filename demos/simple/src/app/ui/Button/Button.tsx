import "./Button.scss"

import { Flow, Flowable } from "@denshya/flow"


interface ButtonProps {
  children: unknown
  color?: Flowable<string>

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  const color = Flow.from(props.color ?? new Flow(""))

  return (
    <button type="button" className="button" classMods={[color]} on={{ click: () => props.onClick?.() }}>{props.children}</button>
  )
}

export default Button
