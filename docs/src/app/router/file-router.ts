import { PathRouter, PathRouterUtils } from "@denshya/router"

import { PageModule } from "./page-module.types"


const config = {
  root: "/docs",
  entry: "index"
}

const filePaths = import.meta.glob("~docs/**/*.{md,mdx}")
const fileRouter = new PathRouter<PageModule>


for (const filePath in filePaths) {
  const pattern = PathRouterUtils.patternFromFilePath(filePath.replace(/(.*)\/\1\.(md|mdx)$/m, "$1").replace(/\.(md|mdx)$/m, ""), config)
  const resource = filePaths[filePath] as () => Promise<PageModule>

  fileRouter.routes.push({ filePath, pattern, resource })
}

export default fileRouter

// Fill missing routes that has children with placeholder routes:
// const patterns = fileRouter.routes.map(x => x.pattern)
// const pageTree = getPages(patterns)
// pageTree.forEach(function fillMissingRoutes(folder) {
//   for (const child of folder.children) {
//     fillMissingRoutes(child)
//   }

//   const route = fileRouter.routes.find(x => x.pattern === folder.path)
//   if (!route) {
//     const placeholderModule: PageModule = {
//       default: () => "123",
//     }
//     fileRouter.routes.push({
//       filePath: route,
//       pattern: folder.path,
//       resource: async () => placeholderModule
//     })
//   }
// })


// function getPages(paths: string[]) {
//   // Map.groupBy(paths, path => path.split("/").filter(Boolean))

//   const root: FolderTree[] = []

//   for (const path of paths) {
//     const parts = path.split("/").filter(Boolean)
//     let currentLevel = root
//     let currentPath = ""

//     for (const part of parts) {
//       currentPath = currentPath ? `${currentPath}/${part}` : part
//       let existing = currentLevel.find(node => node.name === part)
//       if (!existing) {
//         existing = { name: part, path: currentPath, children: [] }
//         currentLevel.push(existing)
//       }
//       currentLevel = existing.children
//     }
//   }

//   return root
// }
