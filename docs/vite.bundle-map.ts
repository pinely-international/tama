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
            imports: [...new Set([...output.imports, ...output.dynamicImports])],
          }
          if (output.isEntry === false) {
            source.modules[output.name] = chunkMeta
          } else {
            source.entries[output.name] = chunkMeta
          }
        }

        if (output.type === "asset") {
          if (output.originalFileNames.length > 0) {
            source.assets[output.fileName] = output.originalFileNames
          }
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
