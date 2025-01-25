import "./Button.scss"

import { NavLink } from "@/navigation"

import { Flow, Flowable } from "@denshya/flow"



interface ButtonLinkProps {
  children: unknown
  to: Flowable<string>

  color?: Flowable<string>

  onClick?(): void | Promise<void>
}

function ButtonLink(props: ButtonLinkProps) {
  const color = Flow.from(props.color)

  return (
    <NavLink to={props.to} className="button" classMods={[color]}>{props.children}</NavLink>
  )
}

export default ButtonLink
