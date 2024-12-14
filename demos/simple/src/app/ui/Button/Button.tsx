import "./Button.scss"

import { Proton } from "@denshya/proton"


interface ButtonProps {
  children: unknown
}

function Button(props: ButtonProps) {
  console.log(props)

  return (
    <button type="button" className="button">{props.children}</button>
  )
}

export default Button
