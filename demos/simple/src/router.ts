import { Events } from "@denshya/proton"

class Router {
  readonly current = new Events.State("")

  navigate(to: string) {
    this.current.set(to)
  }

  [Symbol.subscribe](next: (value: string) => void) { return this.current[Symbol.subscribe](next) }
}

export default Router



export const router = new Router
router[Symbol.subscribe](console.log)
