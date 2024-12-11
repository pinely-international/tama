import { Events, Proton } from "@denshya/proton"
import { Unsubscribable } from "type-fest"


abstract class Navigation<Path = string> {
  abstract readonly path: Path

  abstract navigate(delta: number): void
  abstract navigate(path: Path): void

  abstract [Symbol.subscribe](next: (value: Path) => void): Unsubscribable
}

export default Navigation

namespace WebRouter {
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
  navigate(to: WebRouter.To): void
  navigate(to: string | number | WebRouter.To): void {
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

  [Symbol.subscribe](next: (value: string) => void) { return this.current[Symbol.subscribe](url => next(url.pathname)) }
}



export const navigation = new WebNavigation


export function NavRoute(this: Proton.Shell, props: { path: string; children: unknown }) {
  let children: unknown
  // let timeout: number

  const switchView = (path: string) => {
    if (children == null) {
      children = this.inflator.inflate(<>{props.children}</>)
    }

    // clearTimeout(timeout)
    // if (path !== props.path) {
    //   timeout = setTimeout(() => children = undefined, 100 * 1000)
    // }

    this.view.set(path === props.path ? children : null)
  }

  navigation[Symbol.subscribe](switchView)
  switchView(navigation.path)
}



export function NavLink(props: { to: string; className?: string; children?: unknown }) {
  function onClick(event: MouseEvent) {
    event.preventDefault()
    navigation.navigate(props.to)
  }

  return (
    <a className={props.className} href={props.to} on={{ click: onClick }}>{props.children}</a>
  )
}
