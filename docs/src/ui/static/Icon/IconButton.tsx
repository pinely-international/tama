import Icon, { IconName } from "./Icon"

function IconButton(props: { type?: HTMLButtonElement["type"], name: IconName, label: string, on?: JSX.HTMLElementEvents }) {
  return (
    <button type={props.type ?? "button"} on={props.on}><Icon name={props.name} /></button>
  )
}

export default IconButton
