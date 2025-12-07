import path from "path"
import { defineConfig, Plugin } from "vite"

import articleMdx from "./vite.mdx"


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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [generateBundleMap(), articleMdx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~docs": path.resolve(__dirname, "./docs"),
    },
  },
  server: {
    host: "0.0.0.0"
  },
  build: {
    outDir: "build",

    sourcemap: true,
    emptyOutDir: true,

    emitAssets: true,
    assetsInlineLimit: 0,

    // ssr: true,
    ssrEmitAssets: true,
    rollupOptions: {
      input: {
        index: "./index.html",
        essential: "./src/essential.ts",
      },
      preserveEntrySignatures: "exports-only"
    }
  },
  esbuild: {
    keepNames: false,
    supported: {
      // https://stackoverflow.com/questions/72618944/get-error-to-build-my-project-in-vite-top-level-await-is-not-available-in-the
      "top-level-await": true
    },
  },
})
