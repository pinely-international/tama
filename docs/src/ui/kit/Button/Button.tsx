import "./Button.scss"

import { StateOrPlain } from "@denshya/reactive"
import { LiteralUnion } from "type-fest"


export type ButtonColor = "pink" | "white" | "blue" | "dark"

interface ButtonProps {
  children: unknown
  color?: StateOrPlain<LiteralUnion<ButtonColor, string>>

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  return (
    <button type="button" className="button" classMods={[props.color]} on={{ click: () => props.onClick?.() }}>{props.children}</button>
  )
}

export default Button
