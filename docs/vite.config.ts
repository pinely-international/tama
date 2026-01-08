import path from "path"
import { defineConfig } from "vite"

import generateBundleMap from "./vite.bundle-map"
import articleMdx from "./vite.mdx"



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
    modulePreload: false,

    emitAssets: true,
    assetsInlineLimit: 0,

    // ssr: true,
    ssrEmitAssets: true,
    rollupOptions: {
      input: {
        index: "./index.html",
        essential: "./src/essential.ts",
        routes: "./src/routes.ts",
      },
      preserveEntrySignatures: "exports-only"
    },

    minify: true
  },
  esbuild: {
    keepNames: false,
    supported: {
      // https://stackoverflow.com/questions/72618944/get-error-to-build-my-project-in-vite-top-level-await-is-not-available-in-the
      "top-level-await": true
    },
  },
})
