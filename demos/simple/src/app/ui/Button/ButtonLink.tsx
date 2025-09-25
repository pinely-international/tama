import "./Button.scss"

import { NavLink } from "@/navigation"

import { State, StateOrPlain } from "@denshya/reactive"



interface ButtonLinkProps {
  children: unknown
  to: StateOrPlain<string>

  color?: StateOrPlain<string>

  onClick?(): void | Promise<void>
}

function ButtonLink(props: ButtonLinkProps) {
  const color = State.from(props.color)

  return (
    <NavLink to={props.to} className="button" classMods={[color]}>{props.children}</NavLink>
  )
}

export default ButtonLink
