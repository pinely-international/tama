import path from "node:path"
import { fileURLToPath } from "node:url"

import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import globals from "globals"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [...compat.extends("eslint:recommended"), {
  plugins: {
    "@typescript-eslint": typescriptEslint,
    "simple-import-sort": simpleImportSort,
    "unused-imports": unusedImports,
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.commonjs,
      ...globals.node,
    },
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      requireConfigFile: false,
    },
  },

  rules: {
    "simple-import-sort/imports": "warn",
    "unused-imports/no-unused-imports": "warn",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    semi: ["error", "never"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
  },
}]