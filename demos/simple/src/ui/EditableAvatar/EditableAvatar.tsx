import "./EditableAvatar.scss"

import { Events, Proton } from "@denshya/proton"

import { bem, bemState } from "@/utils/bem"
import Icon from "../Icon/Icon"


interface EditableAvatarProps {
  name?: string
  image: string

  onChange?(file: File): void | Promise<unknown>
}

function EditableAvatar(this: Proton.Shell, props: EditableAvatarProps) {
  const image = new Events.State(props.image)
  const pending = new Events.State(false)

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

  const asd = new Events.State(bem("editable-avatar", { pending: pending.get() }))
  pending[Symbol.subscribe](() => asd.set(bem("editable-avatar", { pending: pending.get() })))

  this.view.set(
    <div className={asd}>
      <img src={image} alt="avatar" className="editable-avatar__image" />
      <label className="editable-avatar__cover">
        <Icon className="editable-avatar__icon" name="touch" />
        <input className="editable-avatar__input" name={props.name} type="file" accept="image/*" on={{ change: onChange }} aria-hidden={false} />
      </label>
    </div>
  )
}

export default EditableAvatar
