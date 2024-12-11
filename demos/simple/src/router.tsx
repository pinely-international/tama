import { Events, Proton } from "@denshya/proton"
import { Unsubscribable } from "type-fest"


abstract class Router<Path = string, Resource = unknown> {
  abstract readonly path: Path
  // abstract readonly resource: Resource | null

  abstract navigate(delta: number): void
  abstract navigate(path: Path): void

  abstract [Symbol.subscribe](next: (value: Path) => void): Unsubscribable
}

export default Router

namespace WebRouter {
  export interface To extends Partial<Pick<Location, "pathname" | "search" | "hash">> {
    state?: unknown
  }
}

export class WebRouter extends Router {
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



export const router = new WebRouter


export function Route(this: Proton.Shell, props: { path: string; children: unknown }) {
  let children: unknown

  const switchView = (path: string) => {
    if (children == null) {
      children = this.inflator.inflate(<>{props.children}</>)
    }

    this.view.set(path === props.path ? children : null)
  }

  router[Symbol.subscribe](switchView)
  switchView(router.path)
}



export function Link(props: { to: string; className?: string; children?: unknown }) {
  function onClick(event: MouseEvent) {
    event.preventDefault()
    router.navigate(props.to)
  }

  return (
    <a className={props.className} href={props.to} on={{ click: onClick }}>{props.children}</a>
  )
}
