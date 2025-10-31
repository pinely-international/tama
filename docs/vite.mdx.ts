import mdx from "@mdx-js/rollup"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import rehypeHighlight from 'rehype-pretty-code'
import { Plugin } from "vite"

function articleMdx(): Plugin {
  return mdx({
    jsxImportSource: "@denshya/proton/jsx/virtual",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, () => rehypeHighlight({ theme: "github-light", keepBackground: false, grid: false })],
  })
}

export default articleMdx


function asd() {
  return () => rehypeAutolinkHeadings({
    test: element => element.tagName !== "h1",
    content: { // <Icon name="link" />
      type: "mdxJsxFlowElement",
      name: "Icon",
      attributes: [{ type: "mdxJsxAttribute", name: "name", value: "link" }],
      children: []
    }
  })
}
