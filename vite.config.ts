import path from "path"
import { defineConfig } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [externalizeDeps({ peerDeps: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: false,
    outDir: "build",
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: [path.resolve(__dirname, "./src/index.ts"), path.resolve(__dirname, "./src/jsx-runtime.ts")],
      formats: ["es"]
    }
  },
  esbuild: {
    treeShaking: true,
    minifyIdentifiers: false,
    keepNames: true
  },
})
