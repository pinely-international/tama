import { AsyncFunction, AsyncGeneratorFunction } from "@/BuiltinObjects"
import WebInflator from "@/Inflator/web/WebInflator"
import { kebabCase } from "@/utils/string"
import { isIterable, isJSX, isObservableGetter, isRecord } from "@/utils/testers"


interface WebInflatorBased {
  inflator?: WebInflator
}


class WebJSXSerializer {
  protected inflator?: WebInflator
  /** Inherits customization and options applied to `inflator`. */
  inherit(inflator: WebInflator) {
    inflator.flags.skipAsync = true
    this.inflator = inflator
  }

  toString(value: unknown): string {
    if (value == null) return ""
    if (Array.isArray(value)) return this.iterableToString(value)

    if (typeof Element !== "undefined" && value instanceof Element) return value.outerHTML
    if (typeof DocumentFragment !== "undefined" && value instanceof DocumentFragment) return this.iterableToString(value.childNodes)
    if (typeof Node !== "undefined" && value instanceof Node) return value.textContent ?? ""

    if (isObservableGetter(value)) return String(value.get())
    if (isIterable(value)) return this.iterableToString(value)

    if (isJSX(value)) {
      if (typeof value.type === "function") {
        return this.componentToString(value.type, value.props)
      }
      return this.jsxToString(value)
    }

    if (value instanceof Object) {
      throw new TypeError("JSX Child can't be object: " + value.constructor)
    }
    return String(value)
  }

  private iterableToString(iterable: Iterable<unknown>) {
    let children = "", child
    for (child of iterable) children += this.toString(child)
    return children
  }

  jsxAttributesToString = WebJSXSerializer.jsxAttributesToString

  jsxToString(jsx: JSX.Element): string {
    if (jsx.props == null) {
      const type = jsx.type

      if (WebJSXSerializer.selfClosingTags[type]) {
        return "<" + type + "/>"
      }
      return "<" + type + "></" + type + ">"
    }

    // Skip for SEO + better visual.
    if (jsx.props["data-nosnippet"] === true) return ""
    if (jsx.props["data-nosnippet"] === "true") return ""

    const children = this.toString(jsx.props.children)
    if (jsx.type.constructor === Symbol) return children

    const type = jsx.type
    const attributes = WebJSXSerializer.jsxAttributesToString.call(this, jsx.props)

    if (WebJSXSerializer.selfClosingTags[type]) {
      return "<" + type + attributes + "/>"
    }
    if (children.length === 0) {
      return "<" + type + attributes + "></" + type + ">"
    }
    return "<" + type + attributes + ">" + children + "</" + type + ">"
  }

  componentToString(factory: Function, props?: any) {
    if (factory instanceof AsyncFunction.constructor) return ""
    if (factory instanceof AsyncGeneratorFunction.constructor) return ""

    return this.toString(factory(props))
  }
}

namespace WebJSXSerializer {
  export function styleToString(style: unknown): string {
    if (isRecord(style)) {
      let styleString = ""
      for (const propertyName in style) {
        const key = kebabCase(propertyName)
        const value = gettable(style[propertyName])

        styleString += key + ":" + value + ";"
      }

      return styleString
    }

    return String(style)
  }

  export function gettable(value: unknown): unknown {
    if (isObservableGetter(value)) return value.get()
    return value
  }

  export function applyCustomJSXAttributes(this: WebInflatorBased, props: any) {
    if (this.inflator == null) return
    if (this.inflator.jsxAttributes.size === 0) return

    const bind = (key: string, value: unknown) => {
      props[key] = gettable(value)
    }

    for (const key of this.inflator.jsxAttributes.keys()) {
      if (key in props === false) continue

      const attributeSetup = this.inflator.jsxAttributes.get(key)!
      attributeSetup({ props, key, value: props[key], bind })
    }
  }

  export function jsxAttributesToString(this: WebInflatorBased, props: any): string {
    if (props == null) return ""

    applyCustomJSXAttributes.call(this, props)

    let attributes = "", key, value
    for (key in props) {
      if (key === "on") continue
      if (key === "ns") continue
      if (key === "children") continue

      if (this.inflator?.jsxAttributes.has(key)) continue

      value = props[key]
      if (value == null) continue

      if (key === "className") key = "class"
      if (key === "style") value = styleToString(value)

      value = gettable(value)
      if (value == null) continue

      attributes += " " + key + "=\"" + value + "\""
    }
    return attributes
  }

  export const selfClosingTags: Record<keyof never, boolean> = {
    "area": true, "base": true, "br": true, "col": true, "embed": true, "hr": true, "img": true, "input": true, "link": true, "meta": true, "param": true, "source": true, "track": true, "wbr": true
  }
}

export default WebJSXSerializer
