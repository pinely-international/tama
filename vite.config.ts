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
    outDir: "build",
    sourcemap: true,
    modulePreload: false,
  },
  esbuild: {
    minifyIdentifiers: false,
    minifyWhitespace: false,
    ignoreAnnotations: true
  }
})
