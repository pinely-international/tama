import { Flow, Flowable } from "@denshya/flow"
import { Proton } from "@denshya/proton"



abstract class Navigation<Path = string> {
  abstract navigate(delta: number): void
  abstract navigate(to: Path): void
}

export default Navigation

namespace WebNavigation {
  export interface To extends Partial<Pick<Location, "pathname" | "search" | "hash">> {
    state?: unknown
  }
}

export class WebNavigation extends Navigation {
  readonly current = new Flow(new URL(window.location.href))

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

  readonly result = new Flow<URLPatternResult | null>(null)

  test(pathPattern: string | undefined | null): boolean {
    const pattern = new URLPattern(pathPattern ?? undefined, window.location.origin)
    const result = pattern.exec(this.current.get().pathname, window.location.origin)

    try {
      this.result.set(result)
    } catch (error) {
      queueMicrotask(() => { throw error })
    } finally {
      return !!result
    }
  }
}



export const navigation = new WebNavigation


export function NavRoute(this: Proton.Shell, props: { path?: string; children: unknown; dynamic?: boolean }) {
  let view: unknown

  let result: RouteContext | null = null

  const switchView = () => {
    if (!navigation.test(props.path)) {
      return this.view.set(null)
    }

    if (result == null) {
      result = this.context.provide(new RouteContext(null))
    }

    result.set(navigation.result.get())

    if (view == null) {
      view = this.inflator.inflate(props.children)
    }

    this.view.set(view)
  }

  switchView()
  navigation.current.sets(switchView)
}



export function NavLink(props: { to: Flowable<string>; className?: Flowable<string>; classMods?: JSX.CustomAttributes["classMods"]; children?: unknown }) {
  const active = Flow.compute((nav, to) => to.length > 1 && nav.pathname.startsWith(to), [navigation.current, props.to])

  function onClick(event: MouseEvent) {
    event.preventDefault()
    navigation.navigate(Flow.get(props.to))
  }

  return (
    <a className={props.className ?? "nav-link"} classMods={[{ active }, props.classMods]} href={props.to} on={{ click: onClick }}>{props.children}</a>
  )
}


export class RouteContext extends Flow<URLPatternResult | null> { }
