import "./Button.scss"

import { Proton } from "@denshya/proton"


interface ButtonProps {
  children: unknown

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  return (
    <button type="button" className="button" on={{ click: () => props.onClick?.() }}>{props.children}</button>
  )
}

export default Button
