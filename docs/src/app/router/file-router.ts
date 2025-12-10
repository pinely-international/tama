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

// type Route = { pattern: string; resource: any };

// interface FolderTree {
//   name: string;
//   path: string;
//   children: FolderTree[];
// }

// == fillMissingIndexRoutes using getPages ==
// function normalizePath(p: string) {
//   if (!p) return "/"
//   if (!p.startsWith("/")) p = "/" + p
//   if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1)
//   return p
// }

// function isIndexPath(p: string) {
//   p = normalizePath(p)
//   const parts = p.split("/").filter(Boolean)
//   return parts.length > 0 && parts[parts.length - 1].toLowerCase() === "index"
// }

// /**
//  * Fill missing index routes. Uses the getPages() tree builder so your snippet is reused exactly as-is.
//  * placeholderBuilder(parentPath, shallowChildren) -> resource
//  */
// function fillMissingIndexRoutes(
//   routes: Route[],
//   {
//     placeholderBuilder = (parentPath: string, shallowChildren: string[]) => ({ placeholder: true, parentPath, shallowChildren }),
//     addAncestors = false,
//     immutable = true,
//   }: {
//     placeholderBuilder?: (parentPath: string, shallowChildren: string[]) => any,
//     addAncestors?: boolean,
//     immutable?: boolean,
//   } = {}
// ): Route[] {
//   const list: Route[] = immutable ? routes.map(r => ({ ...r })) : routes

//   // Normalize incoming paths and collect a set of existing normalized paths
//   const existing = new Set<string>()
//   const inputPaths: string[] = []
//   for (const r of list) {
//     const p = normalizePath(r.pattern)
//     existing.add(p)
//     // pass into getPages without a leading slash so the snippet is truly untouched
//     inputPaths.push(p === "/" ? "/" : p.replace(/^\//, ""))
//   }

//   // Build folder tree from all non-index paths (we want shallow children of parents)
//   const nonIndexPaths = inputPaths.filter(p => {
//     // if p === '/' keep it; getPages will ignore empty
//     return !(p === "/" || isIndexPath("/" + p))
//   })
//   const tree = getPages(nonIndexPaths)

//   // Build a map from parent path (with leading slash) to shallow children (array of full child paths with leading slash)
//   const shallowMap = new Map<string, string[]>()

//   function walk(nodes: FolderTree[]) {
//     for (const node of nodes) {
//       const parent = "/" + node.path // node.path like 'a/b'
//       const children = node.children.map(c => "/" + c.path)
//       shallowMap.set(parent, children)
//       if (node.children.length) walk(node.children)
//     }
//   }
//   walk(tree)

//   const toAdd: Route[] = []

//   function ensureIndexForParent(parentPath: string) {
//     const normalizedParent = normalizePath(parentPath)
//     const filePath = normalizePath("/docs" + normalizedParent + "/index.md")
//     const pattern = normalizePath(normalizedParent)
//     if (!existing.has(filePath) && !toAdd.some(t => normalizePath(t.pattern) === filePath)) {
//       const shallowChildren = shallowMap.get(normalizedParent) || []
//       const resource = placeholderBuilder(normalizedParent, shallowChildren)
//       toAdd.push({ filePath, pattern, resource })
//       existing.add(filePath)
//     }
//   }

//   for (const r of routes) {
//     const p = normalizePath(r.pattern)
//     if (p === "/" || isIndexPath(p)) continue
//     const parts = p.split("/").filter(Boolean)

//     if (addAncestors) {
//       for (let depth = 1; depth < parts.length; depth++) {
//         const parent = "/" + parts.slice(0, depth).join("/")
//         ensureIndexForParent(parent)
//       }
//     } else if (parts.length > 1) {
//       const parent = "/" + parts.slice(0, parts.length - 1).join("/")
//       ensureIndexForParent(parent)
//     }
//   }

//   return toAdd
// }

// const result = fillMissingIndexRoutes(fileRouter.routes, {
//   placeholderBuilder: (parent, children) => async () => {
//     const childrenAsd = children.map(c => fileRouter.routes.find(r => r.pattern === c))
//     const contents = await Promise.all(childrenAsd.map(async x => ({ ...x, module: x && await import(x.filePath + "?raw") })))

//     return {
//       default: () => <GroupContents title={startCase(parent)} contents={contents.map(({ pattern: path, module }) => ({
//         path,
//         title: startCase(path.substring(path.lastIndexOf("/"))),
//         description: JSXParser.fromMarkdown(new Lexer({ gfm: true, gfmLineBreaks: true }).lex(module.default).find(x => x.type === "paragraph")?.raw.replace(/\n{1,}/g, " ") ?? "")
//       }))} />
//     }
//   },
//   addAncestors: false,
// })

// fileRouter.routes.push(...result)
