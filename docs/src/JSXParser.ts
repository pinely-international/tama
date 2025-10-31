import { Lexer, MarkedToken, Tokens } from "markdown-lexer"

interface JSXParserMarkdownOptions {
  components?: Record<string, (props: Record<string, unknown> & { children?: unknown }) => unknown>
}

class JSXParserMarkdown {
  constructor(
    // private readonly options?: { components:  }
    private tokenResolvers?: { [Type in MarkedToken["type"]]?: (token: Type) => unknown }
  ) { }

  /**
   * Maps Markdown `Token` into `JSX.Element` or `string`.
   */
  private resolveToken(anyToken: MarkedToken | Tokens.Generic, options?: JSXParserMarkdownOptions): unknown {
    const token = anyToken as MarkedToken

    const customTokenResolver = this.tokenResolvers?.[token.type]
    if (customTokenResolver != null) return customTokenResolver(token as never)

    const resolveToken = (token: Tokens.Generic) => this.resolveToken(token, options)

    switch (token.type) {
      case "space": return "\n\n"
      case "html": {
        if (token.raw === "<br>") return "\n"

        if (options?.components != null) {
          return this.resolveComponentHTML(token.raw, options as never)
        }

        return "" // Avoid potential `script` tag.
      }
      case "text": return token.text

      case "link":
        return { type: "a", props: { children: token.text } }

      case "heading":
        return { type: "h" + token.depth, props: { children: token.tokens.map(resolveToken) } }

      case "table":
        return {
          type: "table", props: {
            children: [
              {
                type: "thead", props: {
                  children: {
                    type: "tr", props: {
                      children: token.header.map(cell => ({ type: "th", props: { children: cell.tokens.map(resolveToken) } }))
                    }
                  }
                }
              },
              {
                type: "tbody", props: {
                  children: token.rows.map(columns => ({
                    type: "tr", props: {
                      children: columns.map(column => ({
                        type: column.tokens[0].type === "strong" ? "th" : "td", props: { children: column.tokens.map(resolveToken) }
                      }))
                    }
                  }))
                }
              },
            ]
          }
        }

      case "list": return { type: "ul", props: { children: token.items.map(resolveToken) } }
      case "list_item": return { type: "li", props: { children: token.text } }

      default:
        // @ts-expect-error `text` may exist in other tokens.
        return { type: token.type, props: { children: token.text } }
    }
  }

  private resolveComponentHTML(source: string, options: JSXParserMarkdownOptions & { components: Record<string, Function> }) {
    const componentsJSX = []

    for (const execArray of source.matchAll(htmlRegex)) {
      const [, typeString, attrsString, childrenString] = execArray

      const props = this.parseAttrsString(attrsString)
      if (childrenString != null) {
        const asd = childrenString.replace(/^\s+/gm, "")
        props.children = this.toJSX(asd, options)
      }

      const jsx = options.components[typeString](props)
      componentsJSX.push(jsx)
    }

    return componentsJSX
  }

  private parseAttrsString(attrsString: string): Record<string, unknown> {
    const attrEntriesFlat = attrsString.split(/(.*?)="(.*?)"/).filter(Boolean)
    const attrs: Record<string, unknown> = {}

    for (let i = 0; i < attrEntriesFlat.length; i += 2) {
      const key = attrEntriesFlat[i]
      const value = attrEntriesFlat[i + 1]

      attrs[key] = value
    }

    return attrs
  }

  public toJSX(value: string, options?: JSXParserMarkdownOptions): unknown {
    const lexer = new Lexer({
      gfm: true, gfmLineBreaks: true, extensions: {},
    })
    const tokens = lexer.lex(value)
    const children = tokens.flatMap(token => {
      // For some reason the first tokens are always paragraphs.
      if (token.type === "paragraph") {
        return token.tokens?.map(token => this.resolveToken(token, options)) ?? ""
      }

      return this.resolveToken(token, options)
    })
    // If all children are plain `string`, return as it is.
    if (children.every(child => typeof child === "string")) {
      return value
    }

    return children
  }
}

const htmlRegex = /<([A-Z]\w*)\s+(\w+=?"?.*?"?)?(?:>(.*?)<\/\1>|\s*\/>)/gms
namespace JSXParser {
  const jsxMarkdownParser = new JSXParserMarkdown

  export function fromMarkdown(value: string, options?: JSXParserMarkdownOptions) {
    return jsxMarkdownParser.toJSX(value, options)
  }
  export function fromHTML(value: string) {
    value.replace(htmlRegex, "")
  }
}



export default JSXParser
