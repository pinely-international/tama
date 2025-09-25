import "./Button.scss"

import { State, StateOrPlain } from "@denshya/reactive"


interface ButtonProps {
  children: unknown
  color?: StateOrPlain<string>

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  const color = State.from(props.color ?? new State(""))

  return (
    <button type="button" className="button" classMods={[color]} on={{ click: props.onClick }}>{props.children}</button>
  )
}

export default Button
