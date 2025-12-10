import * as path from "path"
import { injectDOMPolyfill } from "./dom"
import { WebJSXSerializerAsync } from "./asyncser"

if (globalThis.URLPattern == null) {
  await import("urlpattern-polyfill")
}

injectDOMPolyfill(globalThis)


const { entries } = await import("../build/bundle.json.map", { with: { type: "json" } })
const { component, inflator } = await import("../build/" + entries.essential.fileName)

const jsxSerializer = new WebJSXSerializerAsync
jsxSerializer.inherit(inflator)

const { default: templateHTML } = await import("../build/index.html?raw")

const { routes } = await import("../build/" + entries.routes.fileName)

routes.forEach(route => {
  const outputPath = path.resolve(import.meta.dirname, "../build/", route.pattern.slice(1) + ".md")
  const inputPath = route.filePath.slice(1)

  Bun.write(Bun.file(outputPath), Bun.file(inputPath))
})

for await (const route of routes) {
  window.location.pathname = route.pattern
  window.dispatchEvent(new PopStateEvent('popstate'));

  const appString = await jsxSerializer.asyncComponentToString(component)
  const html = templateHTML
    .replace("<!--head-->", document.head.innerHTML)
    .replace("<!--element-->", appString)

  Bun.write(Bun.file(path.resolve(import.meta.dirname, "../build/", route.pattern.slice(1) + ".html")), html)
}



window.location.pathname = "/"
window.dispatchEvent(new PopStateEvent('popstate'));

const appString = await jsxSerializer.asyncComponentToString(component)
const html = templateHTML
  .replace("<!--head-->", document.head.innerHTML)
  .replace("<!--element-->", appString)

Bun.write(Bun.file(path.resolve(import.meta.dirname, "../build/", "index.html")), html)
