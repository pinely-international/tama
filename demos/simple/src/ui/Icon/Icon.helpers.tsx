import Icon, { IconName } from "./Icon"

export function Iconize(icon?: IconName) {
  if (icon == null) return null

  if (typeof icon === "string") {
    if (icon.length === 0) return null

    return <Icon name={icon} />
  }

  return icon
}
