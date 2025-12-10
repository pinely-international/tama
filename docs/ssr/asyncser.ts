const AsyncFunction = async function () { }
const AsyncGeneratorFunction = async function* () { }

function kebabCase(text) {
  return text.replace(/([A-Z]+)/g, "-$1").replace(/_/g, "-").toLowerCase()
}

function isRecord(object) {
  return typeof object === "object" && object !== null && !Array.isArray(object) // Weak comparing, may lead to unexpected behavior.
}
function isObservableGetter(value) {
  if (value instanceof Object && value.get instanceof Function && value[Symbol.subscribe] instanceof Function) {
    return true
  }
  return false
}
function isIterable(value) {
  return value instanceof Object && value[Symbol.iterator] instanceof Function
}
function isJSX(value) {
  return isRecord(value) && value.type != null
}

export class WebJSXSerializerAsync {
  /** Inherits customization and options applied to `inflator`. */
  inherit(inflator) {
    // inflator.inflate = this.toString.bind(this);
    const oldInflatenflateComponent = inflator.constructor.prototype.inflateComponent
    inflator.constructor.prototype.inflateComponent = function (factory, props) {
      if (factory instanceof AsyncFunction.constructor) return null
      if (factory instanceof AsyncGeneratorFunction.constructor) return null

      return oldInflatenflateComponent.call(this, factory, props)
    }

    inflator.flags.skipAsync = true
    this.inflator = inflator
  }

  /*
    Synchronous toString — unchanged for sync rendering.
    Async components and async generators are intentionally skipped here (returned as empty string)
    because synchronous rendering cannot await. Use asyncToString / asyncComponentToString instead.
  */
  toString(value) {
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
      throw new TypeError("JSX Child can't be object: " + value.constructor)
    }
    return String(value)
  }
  arrayLikeToString(arrayLike) {
    let children = "", i = 0
    const l = arrayLike.length
    for (; i < l; i++) {
      children += this.toString(arrayLike[i])
    }
    return children
  }
  iterableToString(iterable) {
    let children = "", child
    for (child of iterable) {
      children += this.toString(child)
    }
    return children
  }
  styleToString(style) {
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
  observableToString(value) {
    if (isObservableGetter(value)) return String(value.get())
    return String(value)
  }
  applyCustomJSXAttributes(props) {
    if (this.inflator == null) return
    if (this.inflator.jsxAttributes.size === 0) return
    const bind = (key, value) => {
      props[key] = this.observableToString(value)
    }
    for (const key of this.inflator.jsxAttributes.keys()) {
      if (key in props === false) continue
      const attributeSetup = this.inflator.jsxAttributes.get(key)
      if (attributeSetup == null) continue
      attributeSetup({ props, key, value: props[key], bind })
    }
  }
  jsxAttributesToString(props) {
    if (props == null) return ""
    this.applyCustomJSXAttributes(props)
    let attributes = "", key, value
    for (key in props) {
      if (key === "on") continue
      if (key === "ns") continue
      if (key === "children") continue
      if (this.inflator?.jsxAttributes.has(key)) continue
      value = props[key]
      if (value == null) continue
      if (key === "className") key = "class"
      if (key === "style") value = this.styleToString(value)
      value = this.observableToString(value)
      if (value == null) continue
      attributes += " " + key + "=\"" + value + "\""
    }
    return attributes
  }
  jsxToString(jsx) {
    if (jsx.props == null) {
      const type2 = String(jsx.type)
      if (selfClosingTags.has(type2)) {
        return "<" + type2 + "/>"
      }
      return "<" + type2 + "></" + type2 + ">"
    }
    // Skip for SEO + better visual.
    if (jsx.props["data-nosnippet"] === true) return ""
    if (jsx.props["data-nosnippet"] === "true") return ""

    const children = this.toString(jsx.props.children)
    if (jsx.type.constructor === Symbol) return children
    const type = String(jsx.type)
    const attributes = this.jsxAttributesToString(jsx.props)
    if (selfClosingTags.has(type)) {
      return "<" + type + attributes + "/>"
    }
    if (children.length === 0) {
      return "<" + type + attributes + "></" + type + ">"
    }
    return "<" + type + attributes + ">" + children + "</" + type + ">"
  }

  componentToString(factory, props) {
    if (factory instanceof AsyncFunction.constructor) return ""
    if (factory instanceof AsyncGeneratorFunction.constructor) return ""

    return this.toString(factory.call(void 0, props))
  }

  /* ------------------------- Async rendering helpers ------------------------- */
  _isPromise(value) {
    return value != null && typeof value.then === "function"
  }
  _isAsyncIterable(value) {
    return value != null && typeof value[Symbol.asyncIterator] === "function"
  }

  async asyncToString(value) {
    if (value == null) return ""

    // If it is a promise, await it and continue
    if (this._isPromise(value)) return this.asyncToString(await value)

    // Arrays
    if (Array.isArray(value)) return this.asyncArrayLikeToString(value)

    // DOM nodes
    if (typeof Element !== "undefined" && value instanceof Element) return value.outerHTML
    if (typeof DocumentFragment !== "undefined" && value instanceof DocumentFragment) return this.asyncArrayLikeToString(value.childNodes)
    if (typeof Node !== "undefined" && value instanceof Node) return value.textContent ?? ""

    if (isObservableGetter(value)) return String(value.get())

    // Async iterable
    if (this._isAsyncIterable(value)) return this.asyncAsyncIterableToString(value)

    // Sync iterable
    if (isIterable(value)) return this.asyncIterableToString(value)

    // JSX
    if (isJSX(value)) {

      if (value.type instanceof Function) {
        // If we are in async flow, always call the factory and then recursively asyncToString the result.
        if (value.type instanceof AsyncFunction.constructor || value.type instanceof AsyncGeneratorFunction.constructor) {
          return this.asyncComponentToString(value.type, value.props)
        }
        // synchronous factory; call it and then continue asynchronously to allow nested async children to resolve.
        const result = value.type.call(void 0, value.props)
        return this.asyncToString(result)
      }
      return this.asyncJsxToString(value)
    }

    if (value instanceof Object) throw new TypeError("JSX Child can't be object: " + value.constructor)
    return String(value)
  }

  async asyncArrayLikeToString(arrayLike) {
    let children = ""
    for (let i = 0; i < arrayLike.length; i++) children += await this.asyncToString(arrayLike[i])
    return children
  }

  async asyncIterableToString(iterable) {
    let children = ""
    for (const item of iterable) children += await this.asyncToString(item)
    return children
  }

  async asyncAsyncIterableToString(asyncIterable) {
    let children = ""
    for await (const item of asyncIterable) children += await this.asyncToString(item)
    return children
  }

  // Smart async component renderer.
  async asyncComponentToString(factory, props) {
    // Async function component
    if (factory instanceof AsyncFunction.constructor) {
      const result = await factory.call(void 0, props)
      return this.asyncToString(result)
    }

    // Async generator component — consume once and concatenate all yielded chunks.
    if (factory instanceof AsyncGeneratorFunction.constructor) {
      const iterator = factory.call(void 0, props)
      if (!this._isAsyncIterable(iterator)) return ""

      const { value } = await iterator.next()
      return await this.asyncToString(value)
    }
    // Synchronous factory: call it and then async-render its result so nested async children are handled.
    const result = factory.call(void 0, props)

    return this.asyncToString(result)
  }

  // Deep async JSX renderer: traverses JSX element nodes and awaits children/components.
  async asyncJsxToString(jsx) {
    if (jsx.props == null) {
      const type2 = String(jsx.type)
      if (selfClosingTags.has(type2)) return "<" + type2 + "/>"
      return "<" + type2 + "></" + type2 + ">"
    }

    if (jsx.props["data-nosnippet"] === true) return ""
    if (jsx.props["data-nosnippet"] === "true") return ""

    const children = await this.asyncToString(jsx.props.children)
    if (jsx.type?.constructor === Symbol) return children
    const type = String(jsx.type)
    const attributes = this.jsxAttributesToString(jsx.props)
    if (selfClosingTags.has(type)) return "<" + type + attributes + "/>"
    if (children.length === 0) return "<" + type + attributes + "></" + type + ">"
    return "<" + type + attributes + ">" + children + "</" + type + ">"
  }
}
const selfClosingTags = /* @__PURE__ */ new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"])

