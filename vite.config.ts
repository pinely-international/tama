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
    emptyOutDir: true,
    lib: {
      entry: [path.resolve(__dirname, "./src/index.ts"), path.resolve(__dirname, "./src/jsx-runtime.ts")],
      formats: ["es"],
      fileName: (format, entry) => {
        if (entry.includes("jsx-runtime")) return "jsx-runtime.js"

        return "index.js"
      }
    }
  },
  esbuild: {
    treeShaking: true,
    keepNames: true
  },
})
