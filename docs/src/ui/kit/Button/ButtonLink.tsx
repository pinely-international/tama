import "./Button.scss"

import { StateOrPlain } from "@denshya/reactive"

import Link from "@/app/navigation/Link"


interface ButtonLinkProps {
  children: unknown
  to: StateOrPlain<string>

  color?: StateOrPlain<string>

  onClick?(): void | Promise<void>
}

function ButtonLink(props: ButtonLinkProps) {
  return (
    <Link to={props.to} className="button" classMods={[props.color]}>{props.children}</Link>
  )
}

export default ButtonLink
