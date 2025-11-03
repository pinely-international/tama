import { StateOrPlain } from "@denshya/reactive"

import globalNavigation from "./navigation"


interface LinkProps {
  to: StateOrPlain<string> | undefined | null
  className?: StateOrPlain<string>
  classMods?: JSX.CustomAttributes["classMods"]
  label?: string
  children?: unknown
  id?: string
  style?: JSX.CustomAttributes["style"]
}

function Link(props: LinkProps & { label: string, children?: never }): unknown
function Link(props: LinkProps & { label?: never, children: unknown }): unknown
function Link(props: LinkProps) {
  const resolvedPath = globalNavigation.toResolved(props.to)
  const active = globalNavigation.whenWithin(resolvedPath)

  function onClick(event: MouseEvent) {
    const to = resolvedPath.current
    if (to.includes("://")) return

    event.preventDefault()

    if (to == null) return
    if (to === window.location.pathname) return

    globalNavigation.navigate(to)
  }

  return (
    <a
      id={props.id}
      className={props.className ?? "nav-link"}
      classMods={[{ active }, props.classMods]}
      style={props.style}
      href={resolvedPath ?? undefined}
      on={{ click: onClick }}
      aria={{ ariaLabel: props.label }}
      target={resolvedPath.to(to => to.includes("://") ? "_blank" : "")}
    >{props.children}</a>
  )
}

export default Link
