import "./Button.scss"

import { NavLink } from "@/navigation"

import { bem } from "@/utils/bem"

import { Events } from "@denshya/proton"


interface ButtonLinkProps {
  children: unknown
  to: string

  color?: string | Events.State<string>

  onClick?(): void | Promise<void>
}

function ButtonLink(props: ButtonLinkProps) {
  const color = Events.State.from(props.color ?? new Events.State(""))
  const className = new Events.State(bem("button", [color.get()]))

  color[Symbol.subscribe](() => {
    className.set(bem("button", [color.get()]))
  })

  return (
    <NavLink to={props.to} className="button">{props.children}</NavLink>
  )
}

export default ButtonLink
