import { bemFlow } from "@/utils/bem"
import { Flow, Flowable } from "@denshya/flow"

export type IconName =
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "gear"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "question-mark"
  | "exclamation-mark"
  | "play-circle"
  | "quote"
  | "plus"
  | "minus"
  | "cross"
  | "crown"
  | "check"
  | "tag"
  | "touch"
  | "home"
  | "font-size"
  | "github"
  | "google"
  | "facebook"
  | "timer"
  | "heart"
  | "star"
  | "funnel"
  | "loupe"
  | "dots"
  // | "asd"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {})

interface IconProps extends Partial<JSX.AttributesOf<SVGElement>> {
  href?: string
  className?: Flowable<string>
  name?: Flowable<IconName>
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
  const className = bemFlow(["icon", props.className], [props.name])

  if (props.href) {
    return (
      // <img src={props.href} className={classMerge("icon", props.className && classWithModifiers(props.className, ...props.modifiers || []))} />
      <img src={props.href} className={className} />
    )
  }

  return (
    // <svg {...props} className={classMerge("icon", props.className && classWithModifiers(classWithModifiers(props.className, props.name), ...props.modifiers || []))}>
    <svg {...props} classMods={undefined} className={undefined} class={className}>
      <use href={Flow.from(props.name).to(it => `/static/icons.svg#${it}`)} />
    </svg>
  )
}


export default Icon
