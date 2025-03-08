import { AsyncFunction } from "@/BuiltinObjects"
import WebInflator from "@/Inflator/web/WebInflator"
import { kebabCase } from "@/utils/string"
import { isIterable, isJSX, isObservableGetter, isRecord } from "@/utils/testers"



class WebJSXSerializer {
  private inflator?: WebInflator
  /** Inherits customization and options applied to `inflator`. */
  inherit(inflator: WebInflator) { this.inflator = inflator }

  toString(value: unknown): string {
    if (value == null) return ""
    if (value instanceof Array) return this.arrayLikeToString(value)

    if (value instanceof Element) return value.outerHTML
    if (value instanceof DocumentFragment) return this.arrayLikeToString(value.childNodes)
    if (value instanceof Node) return value.textContent ?? ""

    if (isObservableGetter(value)) return String(value.get())
    if (isIterable(value)) return this.iterableToString(value)

    if (isJSX(value)) {
      if (value.type instanceof Function) {
        return this.componentToString(value.type, value.props)
      }
      return this.jsxToString(value)
    }

    if (value instanceof Object) {
      throw JSON.stringify(value)
    }
    return String(value)
  }

  private arrayLikeToString(arrayLike: ArrayLike<unknown>) {
    let children = "", i = 0
    const l = arrayLike.length
    for (; i < l; i++) {
      children += this.toString(arrayLike[i])
    }
    return children
  }

  private iterableToString(iterable: Iterable<unknown>) {
    let children = "", child
    for (child of iterable) {
      children += this.toString(child)
    }
    return children
  }

  private styleToString(style: unknown): string {
    if (isRecord(style)) {
      let styleString = ""
      for (const propertyName in style) {
        const key = kebabCase(propertyName)
        const value = this.observableToString(style[propertyName])

        styleString += key + ":" + value + ";"
      }

      return styleString
    }

    return String(style)
  }

  private observableToString(value: unknown): string {
    if (isObservableGetter(value)) return String(value.get())
    return String(value)
  }

  jsxToString(jsx: { type: keyof never, props: any }) {
    const children = this.toString(jsx.props.children)
    if (jsx.type.constructor === Symbol) return children

    const type = String(jsx.type)

    let attributes = ""
    if (jsx.props != null) {
      if (this.inflator && this.inflator.jsxAttributes.size > 0) {
        const bind = (key: string, value: unknown) => {
          jsx.props[key] = this.observableToString(value)
        }

        for (const key of this.inflator.jsxAttributes.keys()) {
          if (key in jsx.props === false) continue

          const attributeSetup = this.inflator.jsxAttributes.get(key)
          if (attributeSetup == null) continue

          attributeSetup({ props: jsx.props, key, value: jsx.props[key], bind })
        }
      }

      let key, value
      for (key in jsx.props) {
        if (key === "on") continue
        if (key === "ns") continue
        if (key === "children") continue

        if (this.inflator?.jsxAttributes.has(key)) continue

        value = jsx.props[key]
        if (value == null) continue

        if (key === "className") key = "class"
        if (key === "style") value = this.styleToString(value)

        value = this.observableToString(value)
        if (value == null) continue

        attributes += " " + key + "=\"" + value + "\""
      }
    }

    if (selfClosingTags.has(type)) {
      return "<" + type + attributes + "/>"
    }
    if (children.length === 0) {
      return "<" + type + attributes + "></" + type + ">"
    }
    return "<" + type + attributes + ">" + children + "</" + type + ">"
  }

  componentToString(factory: Function, props?: any) {
    if (factory instanceof AsyncFunction.constructor) return ""

    return this.toString(factory.call(undefined, props))
  }
}

export default WebJSXSerializer


const selfClosingTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"])
