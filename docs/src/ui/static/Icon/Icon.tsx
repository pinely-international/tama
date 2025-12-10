import { State, StateOrPlain } from "@denshya/reactive"

import { bemful } from "@/utils/bem"


export type IconName =
  | "book-read"
  | "play"
  | "headphones"
  | "world"
  | "fountain-pen"
  | "pinely-pink"
  | "triangle"
  | "quote"
  | "chevron-left"
  | "chevron-right"
  | "1-dot-square"
  | "star"
  | "award"
  | "google-calendar"
  | "google-chat"
  | "chronly"
  | "cookie"
  | "check"
  | "check-circle"
  | "sprint"
  | "touch"
  | "folder"
  | "gear-tool-hand"
  | "exclamation-pine"
  | (string & {})

export type StackIconName =
  | ""



interface IconProps {
  href?: string
  className?: StateOrPlain<string>
  classMods?: JSX.CustomAttributes["classMods"]
  name?: StateOrPlain<IconName>
}

/**
 *
 * @prop `modifiers` only work when className given.
 * @prop `className` is a root class, which is modified by `name`,
 * that will be modified by `modifiers` including `name` modifications.
 *
 * Example: `"icon mentor-search__icon mentor-search__icon--chevron mentor-search__icon mentor-search__icon--chevron--up"`
 *
 */
function Icon(props: IconProps) {
  const className = bemful(["icon", props.className], [props.name], props.classMods)

  if (props.href) {
    return (
      <img src={props.href} className={className} aria={{ ariaHidden: true }} />
    )
  }

  return (
    <svg class={className}>
      <use href={State.f`/static/icons.svg#${props.name}`} />
    </svg>
  )
}


export default Icon
