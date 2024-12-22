import "./Button.scss"

import { NavLink } from "@/navigation"

import { bem } from "@/utils/bem"
import { Flow, Flowable } from "@denshya/flow"



interface ButtonLinkProps {
  children: unknown
  to: string

  color?: Flowable<string>

  onClick?(): void | Promise<void>
}

function ButtonLink(props: ButtonLinkProps) {
  const color = Flow.from(props.color ?? new Flow(""))
  const className = new Flow(bem("button", [color.get()]))

  color[Symbol.subscribe](() => {
    className.set(bem("button", [color.get()]))
  })

  return (
    <NavLink to={props.to} className="button">{props.children}</NavLink>
  )
}

export default ButtonLink
