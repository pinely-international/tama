import path from "path"
import rollupTS2 from "rollup-plugin-typescript2"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [rollupTS2({ abortOnError: false, check: false, useTsconfigDeclarationDir: true })],
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

    emptyOutDir: true,

    rollupOptions: {
      external: [/(?!react-modal-global)react.*/],
      treeshake: true
    },
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      formats: ["es"],
      fileName: "index"
    }
  },
  esbuild: {
    treeShaking: true,
    minifyIdentifiers: false,
    minifyWhitespace: false,
    ignoreAnnotations: false,
  },
})
