import path from "node:path"
import { fileURLToPath } from "node:url"

import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import globals from "globals"



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [...compat.extends(
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
), {
  plugins: {
    "@typescript-eslint": typescriptEslint,
    "unused-imports": unusedImports,
    "simple-import-sort": simpleImportSort,
  },

  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.commonjs,
      ...globals.browser,
    },

    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",

    parserOptions: {
      ecmaFeatures: {
        jsx: true,
        modules: true,
      },

      requireConfigFile: false,
    },
  },

  rules: {
    "default-case": "warn",
    "no-multi-spaces": "warn",

    "simple-import-sort/imports": ["warn", {
      groups: [
        ["\\.scss$"],
        ["^\\u0000"],
        ["^node:"],
        ["^@?\\w"],
        ["^"],
        ["^\\."],
        ["^\\.\\."],
      ],
    }],

    "unused-imports/no-unused-imports": "warn",

    "no-restricted-imports": ["warn", {
      patterns: [{
        group: ["@/areas/*/*", "!@/areas/*", "!@/areas/*/types"],
        message: "\"Dependency Flow\" encourages importing only re-exports for `areas`.",
      }, {
        group: ["@/pages/"],
        message: "\"Dependency Flow\" disallows importing `pages`.",
      }],
    }],

    semi: ["warn", "never"],

    indent: ["warn", 2, {
      SwitchCase: 1,
      ignoredNodes: ["PropertyDefinition"],
    }],

    quotes: ["warn", "double", {
      allowTemplateLiterals: true,
    }],

    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/prefer-namespace-keyword": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-empty-object-type": "off"
  },
}]
