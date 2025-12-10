import { Plugin } from "vite"

function generateBundleMap(): Plugin {
  const source = {
    entries: {},
    modules: {},
    assets: {}
  }

  return {
    name: "BundleMap",
    generateBundle(options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === "chunk") {
          const chunkMeta = {
            fileName: output.fileName,
            imports: output.imports,
            dynamicImports: output.dynamicImports,
            assets: [...output.viteMetadata.importedCss]
          }
          if (output.isEntry === false) {
            const moduleId = output.facadeModuleId?.replace(import.meta.dirname, "") ?? "other"
            source.modules[moduleId] = chunkMeta
          } else {
            source.entries[output.name] = chunkMeta
          }
        }

        if (output.type === "asset" && !output.fileName.endsWith(".map")) {
          const chunkMeta = {
            fileName: output.fileName,
            imports: output.names,
          }
          source.assets[output.fileName] = chunkMeta
        }
      }
      this.emitFile({
        type: "asset",
        fileName: "bundle.json.map",
        source: JSON.stringify(source)
      })
    },
  }
}

export default generateBundleMap
