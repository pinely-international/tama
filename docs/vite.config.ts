import path from "path"
import { optimize } from "svgo"
import { defineConfig, Plugin } from "vite"

import articleMdx from "./vite.mdx"


function optimizeSvgExtra(value: string): string {
  value = value.replaceAll("\n", "")
  // value = trimSvgClassesDeep(value)
  value = trimUseless(value)
  value = trimKeyframes(value)
  value = trimRootStyles(value)
  value = trimUnused(value)

  // Must go last after custom trims.
  value = trimIdPrefix(value)
  value = optimizeSvg(value)

  return value
}

function optimizeSvg(value: string): string {
  return optimize(value, {
    floatPrecision: 2,
    multipass: true,
    plugins: [
      "cleanupAttrs",
      "cleanupEnableBackground",
      // "cleanupIds",
      "cleanupNumericValues",
      "collapseGroups",
      "convertColors",
      // "convertEllipseToCircle",
      // "convertPathData",
      // "convertShapeToPath",
      { name: "convertTransform", params: { transformPrecision: 2 } },
      "mergeStyles",
      "inlineStyles",
      "mergePaths",
      "minifyStyles",
      "moveElemsAttrsToGroup",
      "moveGroupAttrsToElems",
      "removeComments",
      "removeDeprecatedAttrs",
      "removeDesc",
      "removeDoctype",
      "removeEditorsNSData",
      "removeEmptyAttrs",
      "removeEmptyContainers",
      "removeEmptyText",
      "removeHiddenElems",
      "removeMetadata",
      "removeNonInheritableGroupAttrs",
      "removeUnknownsAndDefaults",
      "removeUnusedNS",
      "removeUselessDefs",
      "removeUselessStrokeAndFill",
      "removeXMLProcInst",
      "sortAttrs",
      "sortDefsChildren",
      "cleanupListOfValues",
      "convertOneStopGradients",
      "convertStyleToAttrs",
      // "prefixIds",
      // "removeDimensions",
      "removeOffCanvasPaths",
      "removeRasterImages",
      "removeScripts",
      // "removeStyleElement",
      "removeTitle",
      // "removeViewBox",
      "removeXlink",
      // "removeXMLNS",
      "reusePaths",
    ],
  }).data
}

function trimUseless(value: string): string {
  const offset = value.indexOf("xmlns")
  const offsetStart = value.substring(0, offset)

  return offsetStart + value.substring(offset).replace(/( xmlns=".*?")/g, "").replace(/( aria-\w=".*?")/g, "")
}

function trimKeyframes(value: string): string {
  return value.replace(/@keyframes [\w-]+{.*?\}+/g, "")
}

function trimRootStyles(value: string): string {
  return value.replace(/#\w+{.*?}/g, "").replace(/:root{.*?}/g, "")
}

function trimIdPrefix(value: string): string {
  return value.replace(/#\w+ /g, "")
}

function trimUnused(value: string): string {
  return value.replace(/!important/g, "").replace(/p{.*?}/g, "").replace(/\.[\w-]+>div{.*?}/g, "").replace(/;}/g, "}")
}

// function trimSvgClasses(svg: string): string {
//   // 1. Extract <style> content
//   const styleMatch = svg.match(/<style>(.+?)<\/style>/i)
//   const styleContent = styleMatch[1] ?? ""

//   // 2. Collect all class names defined in CSS selectors
//   // Matches ".foo", ".bar", but ignores things like "#id", tags, etc.
//   const classRegex = /(?<=\.)([\w-]+)(?={)/g
//   const classes = new Set<string>(styleContent.match(classRegex))

//   console.log("classes: ", [...classes])
//   // 3. Replace class="..." attributes
//   const result = svg.replace(/ class="(.*?)"/g, (_, classValue: string) => {
//     const used = classValue.split(" ").filter(c => classes.has(c.trim()))
//     console.log(classValue, used)
//     return used.length > 0 ? ` class="${used.join(" ")}"` : ""
//   })

//   return result
// }

// function trimSvgClassesDeep(svg: string): string {
//   if (svg.indexOf("svg", svg.indexOf("svg")) === -1) {
//     return trimSvgClasses(svg)
//   }

//   return svg.replace(/<svg(.*?)>(.*)<\/svg>/g, (_, g1, g2) => `<svg${g1}>${g2}</svg>`)
// }

function hash(value: string) {
  // FNV-1a 32-bit
  let h = 2166136261 >>> 0
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h = h >>> 0

  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"
  const alphabetSize = alphabet.length

  let out = ""
  for (let i = 0; i < 8; i++) {
    out += alphabet[h % alphabetSize]
    h = Math.floor(h / alphabetSize)
  }
  return out
}

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
