import { State, StateArray } from "@denshya/reactive"

import globalNavigation from "@/app/navigation/navigation"
import Breadcrumbs from "@/ui/Breadcrumbs/Breadcrumbs"
import NavigationPanel from "@/ui/NavigationPanel/NavigationPanel"
import TableOfContents from "@/ui/TableOfContents/TableOfContents"
import Footer from "@/ui/semantic/Footer/Footer"
import Topbar from "@/ui/semantic/Topbar/Topbar"
import fileRouter from "../router/file-router"



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

  const pageContents = new StateArray
  globalNavigation.match.subscribeImmediate(async match => {
    if (match == null) return

    const { default: textMD } = await import(match!.route.filePath + "?raw")
    pageContents.set(getPageHeadings(textMD))
  })

  return (
    <>
      <header style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
        <Topbar />
      </header>
      <main style={{ display: "flex", gap: "2.5em" }}>
        <aside>
          <NavigationPanel tree={getPages(fileRouter.routes.map(x => x.pattern))} active={globalNavigation.match.to(x => x?.route.pattern.slice(1) ?? "")} />
        </aside>
        <article style={{ flex: 1 }}>
          <Breadcrumbs path={globalNavigation.match.$.route.$.pattern} />
          <Default />
        </article>
        <aside style={{ display: "grid", alignContent: "baseline", width: "15em" }}>
          <TableOfContents items={pageContents} />
        </aside>
      </main>
      <Footer />
    </>
  )
}

export default NavigationEntrypoint

async function* StateWalker<T>(state: State<T>) {
  yield await state.get()
  // Temporal solution, it should be improved when `Proton` and `State` have lifecycle APIs.
  while (true) yield await state.upcoming
}


function getPageHeadings(markdown: string) {
  const headings = markdown.split("\n").map(line => {
    const match = line.match(/^(#{2,6})\s+(.*)/)
    if (!match) return null

    const level = match[1].length
    const text = match[2].trim()
    return { level, text }
  }).filter(Boolean)

  return headings
}


function getPages(paths: string[]) {
  // Map.groupBy(paths, path => path.split("/").filter(Boolean))

  const root: FolderTree[] = []

  for (const path of paths) {
    const parts = path.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let existing = currentLevel.find(node => node.name === part);
      if (!existing) {
        existing = { name: part, path: currentPath, children: [] };
        currentLevel.push(existing);
      }
      currentLevel = existing.children;
    }
  }

  return root;
}


