import mdx from "@mdx-js/rollup"
import rehypeHighlight, { RehypeShikiOptions } from "@shikijs/rehype"
import { transformerNotationDiff, transformerNotationHighlight, transformerRenderIndentGuides } from "@shikijs/transformers"
import { ShikiTransformer } from "@shikijs/types"
import { Element } from "hast"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import githubAdmonitions from "remark-github-beta-blockquote-admonitions"
import { Plugin } from "vite"
import remarkFrontmatter from "remark-frontmatter"

function articleMdx(): Plugin {
  return mdx({
    jsxImportSource: "@denshya/proton/jsx/virtual",
    remarkPlugins: [
      remarkGfm,
      githubAdmonitions,
      remarkGithubAdmonitions,

      remarkFrontmatter,
      remarkStripFrontmatter
    ],
    rehypePlugins: [rehypeSlug, [rehypeHighlight, shikiConfig]],
  })
}

export default articleMdx


const shikiConfig = {
  theme: "github-light",
  mergeSameStyleTokens: true,
  transformers: [
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerRenderIndentGuides(),
    transformerCodeHeader()
  ]
} satisfies RehypeShikiOptions

// function asd() {
//   return () => rehypeAutolinkHeadings({
//     test: element => element.tagName !== "h1",
//     content: { // <svg class="icon icon--fountain-pen"><use href="/static/icons.svg#fountain-pen"></use></svg>
//       type: "element",
//       tagName: "svg",
//       properties: { className: ["icon", "icon--link"] },
//       children: [
//         {
//           type: "element",
//           tagName: "use",
//           properties: { href: "/static/icons.svg#link" },
//           children: []
//         }
//       ]
//     },
//   })
// }

function transformerCodeHeader(): ShikiTransformer {
  return {
    name: "code-header",
    pre(hast) {
      const metaMap = this.options.meta.__raw.split(" ").reduce((map, next) => {
        const [key, value] = next.split("=")
        if (value == null) return map

        return map.set(key, trimQuotes(value))
      }, new Map)
      const value = metaMap.get("title")
      if (value == null) return hast

      const titleElement: Element = {
        type: "element",
        tagName: "div",
        children: [
          svgIcon(this.options.lang),
          { type: "element", tagName: "span", children: [{ type: "text", value }], properties: {} }
        ],
        properties: { className: ["code-header"] },
      }
      hast.children.unshift(titleElement)
      return hast
    },
  }
}

function trimQuotes(value: string): string {
  if (value.startsWith("\"") && value.endsWith("\"")) {
    return value.slice(1, -1)
  }
  return value
}



function svgIcon(name: string): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: "icon icon--link" },
    children: [
      { // <svg class="icon icon--fountain-pen"><use href="/static/icons.svg#fountain-pen"></use></svg>
        type: "element",
        tagName: "svg",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "use",
            properties: { href: `/static/icons.svg#${name}` },
            children: []
          }
        ]
      }
    ]
  }
}


function remarkGithubAdmonitions() {
  return (tree) => {
    visit(tree, "blockquote", (node, index, parent) => {
      if (!node.children || !node.children.length) return

      const paragraph = node.children[0]
      if (paragraph.type !== "paragraph") return

      const textNode = paragraph.children[0]
      if (!textNode || textNode.type !== "text") return
    })
  }
}


function visit(node, type, fn) {
  if (Array.isArray(node)) {
    for (const child of node) visit(child, type, fn)
    return
  }
  if (node.type === type) fn(node)
  if (node.children) visit(node.children, type, fn)
}




function remarkStripFrontmatter() {
  return tree => {
    tree.children = tree.children.filter(node => node.type !== "yaml" && node.type !== "toml")
  }
}
