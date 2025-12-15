import { AsyncFunction, AsyncGeneratorFunction } from "@/BuiltinObjects"
import WebInflator from "@/Inflator/web/WebInflator"
import { isAsyncIterable, isIterable, isJSX, isObservableGetter, isPromiseLike } from "@/utils/testers"

import WebJSXSerializer from "./JSXSerializer"



class WebJSXSerializerAsync {
  protected inflator?: WebInflator
  /** Inherits customization and options applied to `inflator`. */
  inherit(inflator: WebInflator) {
    this.inflator = inflator
  }

  async asyncToString(value: unknown): Promise<string> {
    if (value == null) return ""

    if (isPromiseLike(value)) return this.asyncToString(await value)
    if (Array.isArray(value)) return this.iterableToStringAsync(value)

    // DOM nodes
    if (typeof Element !== "undefined" && value instanceof Element) return value.outerHTML
    if (typeof DocumentFragment !== "undefined" && value instanceof DocumentFragment) return this.iterableToStringAsync(value.childNodes)
    if (typeof Node !== "undefined" && value instanceof Node) return value.textContent ?? ""

    if (isObservableGetter(value)) return this.asyncToString(value.get())

    if (isIterable(value)) return this.iterableToStringAsync(value)
    if (isAsyncIterable(value)) return this.asyncIterableToString(value)

    // JSX
    if (isJSX(value)) {
      if (typeof value.type === "function") {
        return this.asyncComponentToString(value.type, value.props)
      }
      return this.asyncJsxToString(value)
    }

    if (value instanceof Object) {
      throw new TypeError("JSX Child can't be object: " + value.constructor)
    }

    return String(value)
  }

  async iterableToStringAsync(iterable: Iterable<unknown>) {
    let children = ""
    for (const item of iterable) children += await this.asyncToString(item)
    return children
  }

  private async asyncIterableToString(iterable: AsyncIterable<unknown>) {
    return await iterable[Symbol.asyncIterator]().next()
  }

  async asyncComponentToString(factory: Function, props?: unknown): Promise<string> {
    if (factory instanceof AsyncFunction.constructor) {
      const result = await factory(props)
      return this.asyncToString(result)
    }

    if (factory instanceof AsyncGeneratorFunction.constructor) {
      const iterator = factory(props)
      if (!isAsyncIterable(iterator)) return ""

      const { value } = await iterator.next()
      return await this.asyncToString(value)
    }

    return this.asyncToString(factory(props))
  }

  async asyncJsxToString(jsx: any): Promise<string> {
    if (jsx.props == null) {
      const type = jsx.type
      if (WebJSXSerializer.selfClosingTags[type]) return "<" + type + "/>"
      return "<" + type + "></" + type + ">"
    }

    if (jsx.props["data-nosnippet"] === true) return ""
    if (jsx.props["data-nosnippet"] === "true") return ""

    const children = await this.asyncToString(jsx.props.children)
    if (jsx.type?.constructor === Symbol) return children

    const type = jsx.type
    const attributes = WebJSXSerializer.jsxAttributesToString.call(this, jsx.props)

    if (WebJSXSerializer.selfClosingTags[type]) return "<" + type + attributes + "/>"
    if (children.length === 0) return "<" + type + attributes + "></" + type + ">"
    return "<" + type + attributes + ">" + children + "</" + type + ">"
  }
}


export default WebJSXSerializerAsync
