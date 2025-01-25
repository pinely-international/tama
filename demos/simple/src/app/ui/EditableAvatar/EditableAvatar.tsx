import "./EditableAvatar.scss"

import { Proton } from "@denshya/proton"

import Icon from "../Icon/Icon"
import { Flow } from "@denshya/flow"


interface EditableAvatarProps {
  name?: string
  image: string

  onChange?(file: File): void | Promise<unknown>
}

function EditableAvatar(this: Proton.Shell, props: EditableAvatarProps) {
  const image = new Flow(props.image)
  const pending = new Flow(false)

  async function onChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement

    // checks
    const files = target.files
    if (files === null) return

    const file = files[0] as File | undefined
    if (file == null) return

    // awaits
    if (props.onChange) {
      pending.set(true)
      await props.onChange?.(file)
      pending.set(false)
    }

    // updates
    image.set(URL.createObjectURL(file))
  }

  return (
    <div className="editable-avatar" classMods={{ pending }}>
      <img src={image} alt="avatar" className="editable-avatar__image" />
      <label className="editable-avatar__cover">
        <Icon className="editable-avatar__icon" name="touch" />
        <input className="editable-avatar__input" name={props.name} type="file" accept="image/*" on={{ change: onChange }} aria-hidden={false} />
      </label>
    </div>
  )
}

export default EditableAvatar
