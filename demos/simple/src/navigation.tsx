import { Events, Proton } from "@denshya/proton"
import { Unsubscribable } from "type-fest"
import { bem } from "./utils/bem"



abstract class Navigation<Path = string> {
  abstract navigate(delta: number): void
  abstract navigate(to: Path): void

  abstract [Symbol.subscribe](next: () => void): Unsubscribable
}

export default Navigation

namespace WebNavigation {
  export interface To extends Partial<Pick<Location, "pathname" | "search" | "hash">> {
    state?: unknown
  }
}

export class WebNavigation extends Navigation {
  private readonly current = new Events.State(new URL(window.location.href))

  get path() { return this.current.get().pathname }
  get url() { return this.current.get() }
  get state() { return window.history.state }

  constructor() {
    super()

    window.addEventListener("popstate", () => {
      this.current.set(new URL(window.location.href))
    })
  }

  navigate(delta: number): void
  navigate(path: string): void
  navigate(to: WebNavigation.To): void
  navigate(to: string | number | WebNavigation.To): void {
    if (typeof to === "number") return void window.history.go(to)
    if (typeof to === "object") {
      this.current.set(this.push(to.pathname, to.state, to.hash, to.search))
      return
    }

    this.current.set(this.push(to))
  }

  private push(path = window.location.pathname, state = window.history.state, hash = window.location.hash, search = window.location.search) {
    const url = new URL(path, window.location.origin)

    url.hash = hash
    url.search = search

    window.history.pushState(state, "", url)
    return url
  }

  [Symbol.subscribe](next: () => void) { return this.current[Symbol.subscribe](() => next()) }
}



export const navigation = new WebNavigation


export function NavRoute(this: Proton.Shell, props: { path?: string; children: unknown }) {
  let children: unknown

  const switchView = () => {
    if (navigation.path !== props.path) {
      return this.view.set(null)
    }

    if (children == null) {
      children = this.inflator.inflate(<>{props.children}</>)
    }

    this.view.set(children)
  }

  navigation[Symbol.subscribe](switchView)
  switchView()
}



export function NavLink(props: { to: string; className?: string; children?: unknown }) {
  const className = new Events.State(bem(props.className ?? "nav-link", { active: navigation.path === props.to }))

  navigation[Symbol.subscribe](() => {
    className.set(bem(props.className ?? "nav-link", { active: navigation.path === props.to }))
  })

  function onClick(event: MouseEvent) {
    event.preventDefault()
    navigation.navigate(props.to)
  }

  return (
    <a className={className} href={props.to} on={{ click: onClick }}>{props.children}</a>
  )
}
