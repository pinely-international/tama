import "./Button.scss"


interface ButtonProps {
  children: unknown
}

function Button(props: ButtonProps) {
  return (
    <div className="button">{props.children}</div>
  )
}

export default Button
