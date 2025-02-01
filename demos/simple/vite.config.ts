import path from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: false,
    sourcemap: true,
    modulePreload: false
  },
  esbuild: {
    keepNames: false,

    supported: {
      "top-level-await": true
    },
  },
})
