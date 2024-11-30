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
    sourcemap: true,
  },
  esbuild: {
    treeShaking: true,
    minifyIdentifiers: false,
    minifyWhitespace: true,
    ignoreAnnotations: false,
  },
  optimizeDeps: {
    exclude: ["@denshya/proton"]
  }
})
