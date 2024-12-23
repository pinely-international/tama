import "./Button.scss"

import { bemFlow } from "@/utils/bem"

import { Flow, Flowable } from "@denshya/flow"


interface ButtonProps {
  children: unknown
  color?: Flowable<string>

  onClick?(): void | Promise<void>
}

function Button(props: ButtonProps) {
  const color = Flow.from(props.color ?? new Flow(""))

  return (
    <button type="button" className={bemFlow("button", [color])} on={{ click: () => props.onClick?.() }}>{props.children}</button>
  )
}

export default Button
