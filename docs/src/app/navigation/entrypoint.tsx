import { State } from "@denshya/reactive"

import globalNavigation from "@/app/navigation/navigation"
import fileRouter from "../router/file-router"
import Link from "./Link"



async function NavigationEntrypoint() {
  const module = globalNavigation.match.to(match => {
    if (match == null) throw new TypeError("Can't find any module to navigate to. Make sure 404 page exist.")
    return match.route.resource()
  })
  await module.current

  async function* Default() {
    for await (const pageModule of StateWalker(module)) {
      yield pageModule.default()
    }
  }

  return (
    <>
      <main style={{ display: "flex", gap: "2.5em" }}>
        <aside style={{ display: "grid", alignContent: "baseline", width: "15em" }}>
          {fileRouter.routes.filter(route => route.pattern.startsWith("/learn")).map(route => (
            <Link to={route.pattern}>
              {route.pattern.substring(7)}
            </Link>
          ))}
        </aside>
        <article style={{ flex: 1 }}>
          <Default />
        </article>
        <aside style={{ display: "grid", alignContent: "baseline", width: "15em" }}>
          {fileRouter.routes.filter(route => route.pattern.startsWith("/learn")).map(route => (
            <Link to={route.pattern}>
              {route.pattern.substring(7)}
            </Link>
          ))}
        </aside>
      </main>
    </>
  )
}

export default NavigationEntrypoint

async function* StateWalker<T>(state: State<T>) {
  yield await state.get()
  // Temporal solution, it should be improved when `Proton` and `State` have lifecycle APIs.
  while (true) yield await state.upcoming
}
