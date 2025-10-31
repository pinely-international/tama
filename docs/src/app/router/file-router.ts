import { PathRouter, PathRouterUtils } from "@denshya/router"

import { PageModule } from "./page-module.types"


const config = {
  root: "/src/pages",
  entry: "index"
}

const filePaths = {
  ...import.meta.glob("@/pages/**/*.{jsx,tsx}"),
  ...import.meta.glob("~docs/**/*.{md,mdx}")
}
const fileRouter = new PathRouter<PageModule>

for (const filePath in filePaths) {
  const pattern = PathRouterUtils.patternFromFilePath(filePath.replace("/docs", "").replace(/\.(jsx|tsx|md|mdx)$/m, ""), config)
  const resource = filePaths[filePath] as () => Promise<PageModule>

  fileRouter.routes.push({ filePath, pattern, resource })
}

export default fileRouter
