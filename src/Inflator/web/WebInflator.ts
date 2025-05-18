import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "@/Accessor"
import { AsyncFunction, AsyncGeneratorFunction } from "@/BuiltinObjects"
import { CustomAttributesMap, JSXAttributeSetup } from "@/jsx/JSXCustomizationAPI"
import ProtonJSX from "@/jsx/ProtonJSX"
import Observable from "@/Observable"
import { ProtonComponent } from "@/Proton/ProtonComponent"
import { isJSX, isRecord } from "@/utils/testers"
import WebNodeBinding from "@/utils/WebNodeBinding"

import { NAMESPACE_MATH, NAMESPACE_SVG } from "./consts"
import { isNode, nonGuard } from "./helpers"

import Inflator from "../Inflator"


type WebInflateResult<T> =
  T extends Node ? T :
  T extends JSX.Element ? Element :
  T extends Observable<unknown> ? Text :
  T extends (undefined | null) ? T :
  T extends Primitive ? Text :
  Node


interface WebInflatorFlags {
  debug: boolean,
  skipAsync: boolean
}

class WebInflator extends Inflator {
  flags: WebInflatorFlags = {
    debug: false,
    skipAsync: false,
  }
  /**
   * Custom JSX attributes.
   * Adds or Overrides JSX attribute to provide new behavior.
   * These attributes are virtual and won't be presented in the element.
   * */
  jsxAttributes: CustomAttributesMap = new Map<string, JSXAttributeSetup<any>>()

  protected clone() {
    const clone = new WebInflator
    clone.flags = { ...this.flags }
    clone.jsxAttributes = new Map(this.jsxAttributes)
    return clone
  }

  protected inflateGroup(name: string, debugValue: string) {
    const group = document.createElement("div")
    group.style.display = "contents"

    this.setDebugMarker(group, name, debugValue)

    return group
  }

  protected setDebugMarker(target: object, name: string, debugValue: string) {
    // @ts-expect-error ok.
    target["__" + name] = debugValue
    if (this.flags.debug && target instanceof Element) target.setAttribute(name, debugValue)
  }

  public inflate<T>(subject: T): WebInflateResult<T> {
    if (subject instanceof Node) return subject as never
    if (isJSX(subject)) return this.inflateJSXDeeply(subject) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Text {
    return new Text(String(primitive))
  }

  protected inflateFragment() {
    return new DocumentFragment
    return this.inflateGroup("fragment", this.component?.factory?.name ?? "[unknown]")
  }

  public inflateJSX(jsx: ProtonJSX.Node): Node {
    if (jsx instanceof ProtonJSX.Intrinsic) return this.inflateIntrinsic(jsx.type, jsx.props)
    if (jsx instanceof ProtonJSX.Component) return this.inflateComponent(jsx.type, jsx.props)
    if (jsx instanceof ProtonJSX.Fragment) return this.inflateFragment()

    // Alternatives checks.
    switch (typeof jsx.type) {
      case "string": return this.inflateIntrinsic(jsx.type, jsx.props)
      case "function": return this.inflateComponent(jsx.type, jsx.props)
      default: break
    }

    throw new TypeError("Unsupported type of `jsx`", { cause: { jsx } })
  }

  protected inflateObservable<T>(observable: Observable<T> & AccessorGet<T>) {
    const textNode = new Text(String(observable.get?.()))

    observable[Symbol.subscribe](value => textNode.textContent = String(observable.get?.() ?? value))
    this.setDebugMarker(textNode, "observable", observable.constructor.name)

    return textNode
  }

  protected inflateIterable<T>(iterable: IteratorObject<T>): unknown {
    const iterableGroup = this.inflateGroup("iterable", iterable.constructor.name)

    const inflateItem = (item: unknown) => this.inflate(item)

    iterableGroup.replaceChildren(...iterable[Symbol.iterator]().filter(Boolean).map(inflateItem))

    // @ts-expect-error fine.
    iterable[Symbol.subscribe]?.(replace)

    function replace(newIterable: IteratorObject<T>) {
      // Previous nodes will be lost at this point.
      iterableGroup.replaceChildren(...newIterable[Symbol.iterator]().filter(Boolean).map(inflateItem))
    }

    return iterableGroup
  }
  protected inflateAsyncIterable<T>(asyncIterable: AsyncIteratorObject<T>): unknown {
    throw new TypeError("Async Iterator is not supported", { cause: { asyncIterable } })
  }

  private inflateJSXDeeply(jsx: ProtonJSX.Node): Element | DocumentFragment | Node {
    const inflated = this.inflateJSX(jsx)
    // Inflation of Component children is handled by the component itself.
    if (jsx instanceof ProtonJSX.Component) return inflated

    this.inflateJSXIntrinsicChildren(jsx, inflated)

    return inflated
  }

  private inflateJSXIntrinsicChildren(jsx: ProtonJSX.Intrinsic | ProtonJSX.Fragment, inflated: Node): void {
    if (jsx.props?.children == null) return

    // @ts-expect-error 123
    const actualInflated = inflated instanceof Comment ? inflated.inflated : inflated

    const appendChildObject = (child: ProtonJSX.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (!isNode(childInflated)) return

      try {
        actualInflated.appendChild(childInflated)
      } catch (error) {
        console.debug("appendChildObject -> ", child, childInflated)
        console.trace(error)
        throw error
      }
    }

    if (jsx.props.children instanceof Array === false) appendChildObject(jsx.props.children)
    if (jsx.props.children instanceof Array) jsx.props.children.forEach(appendChildObject)
  }

  protected inflateElement(type: string, namespaceOverride?: string) {
    if (namespaceOverride != null) return document.createElementNS(type, namespaceOverride)

    if (NAMESPACE_SVG.has(type)) return document.createElementNS("http://www.w3.org/2000/svg", type)
    if (NAMESPACE_MATH.has(type)) return document.createElementNS("http://www.w3.org/1998/Math/MathML", type)

    return document.createElement(type)
  }

  /**
   * Creates element and binds properties.
   */
  public inflateIntrinsic(type: unknown, props?: any): Element | Comment {
    if (typeof type !== "string") {
      throw new TypeError(typeof type + " type of intrinsic element is not supported", { cause: { type } })
    }

    const inflated = this.inflateElement(type, props?.ns)
    if (props == null) return inflated

    try {
      const properties = Object.entries(props)
      const overridden = this.bindCustomProperties(props, inflated)

      for (const [key, value] of properties) {
        if (key === "children") continue
        if (overridden.has(key)) continue

        WebInflator.bindProperty(key, value, inflated)
      }

      const immediateGuard = this.applyGuardMounting(inflated, properties, type)
      if (immediateGuard != null) {
        // @ts-expect-error 123
        immediateGuard.inflated = inflated
        return immediateGuard
      }
    } catch (error) {
      console.error("Element props binding failed -> ", error)
    }

    return inflated
  }

  public inflateComponent(factory: Function, props?: any) {
    if (this.flags.skipAsync) {
      if (factory instanceof AsyncFunction.constructor) return null
      if (factory instanceof AsyncGeneratorFunction.constructor) return null
    }
    const component = new ProtonComponent(this, this.component)

    const componentPlaceholder = new WebComponentPlaceholder(component, factory)
    const componentWrapper = new WebTempFragment
    componentWrapper.append(componentPlaceholder)
    componentWrapper.target = componentPlaceholder
    componentWrapper.fixedNodes = [componentPlaceholder]

    const asd = component.getView()
    if (asd != null) componentWrapper.append(asd)

    let currentView: Node = componentPlaceholder

    // If arrow function, simplify inflation.
    if (factory.prototype == null && factory instanceof AsyncFunction.constructor === false) {
      return this.inflate(factory(props))
    }

    const replace = (view: unknown) => {
      let nextView = view
      if (view === null) {
        nextView = componentPlaceholder
        // @ts-expect-error by design.
        nextView.replacedWith = null
      }
      if (nextView instanceof Node === false) return

      let actualNextView = nextView
      if (actualNextView.toBeReplacedWith != null) {
        const toBeReplacedWith = actualNextView.toBeReplacedWith

        actualNextView.toBeReplacedWith = null
        actualNextView = toBeReplacedWith
      }

      currentView = resolveReplacedNode(currentView)
      currentView.toBeReplacedWith = actualNextView

      if (currentView.replaceWith instanceof Function) {
        if (currentView.parentNode != null) {
          if (actualNextView instanceof DocumentFragment && actualNextView.childNodes.length === 0) {
            actualNextView.replaceChildren(...actualNextView.fixedNodes)
          }

          currentView.replaceWith(actualNextView)
          currentView.toBeReplacedWith = null
        }

        if (view !== null) {
          // @ts-expect-error by design.
          currentView.replacedWith = nextView
        } else {
          // @ts-expect-error by design.
          currentView.replacedWith = null
        }
        // @ts-expect-error by design.
        nextView.replacedWith = null
        // @ts-expect-error by design.
        actualNextView.replacedWith = null

        currentView = nextView

        return
      }

      if (currentView instanceof DocumentFragment) {
        // @ts-expect-error by design.
        const fixed = currentView.fixedNodes as Node[]
        const fixedNodes = fixed.map(node => WebComponentPlaceholder.actualOf(node) ?? node)

        const anchor = fixedNodes[0]

        if (actualNextView instanceof DocumentFragment) {
          // @ts-expect-error by design.
          const firstFixed = actualNextView.fixedNodes[0]
          const actualAnchor = WebComponentPlaceholder.actualOf(firstFixed) ?? firstFixed

          if (actualAnchor === anchor) return
        }

        if (anchor.parentElement != null) {
          anchor.parentElement.replaceChild(actualNextView, anchor)
          currentView.toBeReplacedWith = null
        }
        currentView.replaceChildren(...fixedNodes)

        if (view !== null) {
          // @ts-expect-error by design.
          currentView.replacedWith = nextView
        } else {
          // @ts-expect-error by design.
          currentView.replacedWith = null
        }
        // @ts-expect-error by design.
        nextView.replacedWith = null
        // @ts-expect-error by design.
        actualNextView.replacedWith = null

        currentView = nextView

        if (anchor instanceof WebComponentPlaceholder) {
          // @ts-expect-error no another way.
          anchor.shell.events.dispatch("unmount")
        }

        return
      }
    }


    let lastAnimationFrame = -1
    component.on("view").subscribe(view => {
      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => replace(view))
    })

    try {
      ProtonComponent.evaluate(component, factory, props)
    } catch (error) {
      console.error(error)
      return this.inflate(error)
    }

    return componentWrapper
  }

  protected applyGuardMounting(element: Element, properties: [string, unknown][], type: string) {
    let mountPlaceholder: Comment | null = null

    function toggleMount(condition: unknown) {
      if (condition) {
        if (mountPlaceholder?.parentElement == null) return
        mountPlaceholder!.replaceWith(element)
      } else {
        if (element.parentElement == null) return
        element.replaceWith(mountPlaceholder!)
      }
    }

    let guards: Map<string, boolean> | null = null
    let immediateGuard = false

    for (const [key, property] of properties) {
      if (property instanceof Object === false) continue

      // @ts-expect-error `valid` property is there.
      if (key === "mounted") property.valid = nonGuard

      if ("valid" in property === false) continue
      if (property.valid instanceof Function === false) continue

      const accessor = Accessor.extractObservable(property)
      if (accessor == null) continue

      if (mountPlaceholder == null) {
        mountPlaceholder = new Comment(type)
      }
      if (guards == null) guards = new Map<string, boolean>()

      accessor.subscribe?.(value => {
        value = accessor.get?.() ?? value
        // @ts-expect-error should be fine actually.
        const valid = property.valid(value)
        guards!.set(key, valid)

        toggleMount(guards!.values().every(Boolean))
      })

      if (accessor.get && property.valid(accessor.get()) === false) {
        immediateGuard = true
      }
    }

    if (immediateGuard) return mountPlaceholder
  }

  protected bindStyle(style: unknown, element: ElementCSSInlineStyle) {
    if (isRecord(style)) {
      for (const property in style) {
        if (property.startsWith("--")) {
          WebInflator.bindPropertyCallback(style[property], value => element.style.setProperty(property, String(value)))
          continue
        }

        WebInflator.bindProperty(property, style[property], element.style)
      }

      return
    }

    WebInflator.bindPropertyCallback(style, value => element.style.cssText = String(value))
  }

  protected bindEventListeners(listeners: any, element: Element) {
    // @ts-expect-error by design.
    const catchCallback = this.component?.catchCallback

    if (catchCallback == null)
      for (const key in listeners) {
        element.addEventListener(key, listeners[key])
      }
    if (catchCallback != null)
      for (const key in listeners) {
        element.addEventListener(key, event => {
          try {
            listeners[key].call(event.currentTarget, event)
          } catch (thrown) {
            if (catchCallback != null) return void catchCallback(thrown)

            throw thrown
          }
        })
      }
  }

  /** @returns property names that were overridden. */
  protected bindCustomProperties(props: any, element: Element): Set<string> {
    const overrides = new Set<string>()

    if (isRecord(props.on)) {
      this.bindEventListeners(props.on, element)
      overrides.add("on")
    }

    if (element instanceof HTMLElement && "style" in props) {
      this.bindStyle(props.style, element)
      overrides.add("style")
    }

    if ("aria" in props) {
      for (const key in props.aria) {
        WebInflator.bindProperty(key, props, element)
      }
      overrides.add("aria")
    }

    if (element instanceof SVGElement) {
      if (props.class != null) {
        WebInflator.bindPropertyCallback(props.class, value => element.setAttribute("class", String(value)))
        overrides.add("class")
      }

      if (props.href != null) {
        WebInflator.bindPropertyCallback(props.href, (href: any) => {
          if (typeof href === "string") element.setAttribute("href", href)
          if (typeof href === "object") element.setAttribute("href", href.baseVal)
        })

        overrides.add("href")
      }
    }

    if (element instanceof HTMLInputElement) {
      // Ensures correct type beforehand.
      WebInflator.bindProperty("type", props.type, element)

      WebNodeBinding.dualSignalBind(element, "valueAsDate", props.valueAsDate, "input")
      WebNodeBinding.dualSignalBind(element, "valueAsNumber", props.valueAsNumber, "input")

      overrides.add("type").add("valueAsDate").add("valueAsNumber")
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      WebNodeBinding.dualSignalBind(element, "value", props.value, "input")
      overrides.add("value")
    }
    if (element instanceof HTMLSelectElement) {
      WebNodeBinding.dualSignalBind(element, "value", props.value, "change")
      overrides.add("value")
    }


    if (this.jsxAttributes.size > 0) {
      function bind(key: string, value: unknown) {
        WebInflator.bindProperty(key, value, element)
        overrides.add(key)
      }

      for (const [key, attributeSetup] of this.jsxAttributes.entries()) {
        if (key in props === false) continue

        attributeSetup({ props, key, value: props[key], bind })
        overrides.add(key)
      }
    }

    return overrides
  }

  /**
   * Binds a property
   */
  static bindProperty(key: keyof never, source: unknown, target: unknown): void {
    WebInflator.bindPropertyCallback(source, value => (target as any)[key] = value)
  }

  static bindPropertyCallback(source: unknown, targetBindCallback: (value: unknown) => void): void {
    if (source == null) return
    if (typeof source !== "object" && typeof source !== "function") {
      targetBindCallback(source)
      return
    }

    const accessor = Accessor.extractObservable(source)
    if (accessor == null) return
    if (accessor.get == null && accessor.subscribe == null) return

    if (accessor.get) targetBindCallback(accessor.get())
    if (accessor.subscribe) accessor.subscribe(value => targetBindCallback(accessor.get?.() ?? value))
  }
}

export default WebInflator

function resolveReplacedNode(node: Node) {
  const seen = new Set()
  seen.add(node)

  while (node?.replacedWith) {
    if (seen.has(node.replacedWith)) break
    seen.add(node)
    node = node.replacedWith
  }

  return node
}

// function ensureReplaceNodeWith(node, replacement) {
//   node = resolveReplacedNode(node)
//   replacement = resolveReplacedNode(replacement)
//   if (node === replacement) return

//   node.replacedWith = replacement
//   node.replaceWith?.(replacement)
// }

// function resolveReplacedNode(node: Node): Node {
//   let replacedWith: Node | null = node
//   let nextReplacedWith: Node | null = node

//   while (nextReplacedWith != null) {
//     replacedWith = nextReplacedWith
//     nextReplacedWith = getInternalProperty<Node | null>(nextReplacedWith, "replacedWith")

//     // Resolve cycle and self-replace.
//     if (nextReplacedWith === node) {
//       return node
//     }
//   }

//   // Resolve self-replace.
//   if (replacedWith === node) {
//     return node
//   }

//   // Collapse the replacedWith graph for easier debugging and reducing loops for the next time.
//   setInternalProperty(node, "replacedWith", replacedWith)
//   return replacedWith
// }

// function ensureReplaceNodeWith(node: Node | ChildNode, replacement: Node) {
//   node = resolveReplacedNode(node) as Node | ChildNode
//   replacement = resolveReplacedNode(replacement)

//   if (node === replacement) return

//   setInternalProperty(node, "replacedWith", replacement)
//   if ("replaceWith" in node) node.replaceWith(replacement)
// }


// function setInternalProperty(target: any, key: string, value: unknown) {
//   target["__" + key] = value
// }
// function getInternalProperty<T>(target: any, key: string): T {
//   return target["__" + key]
// }

class WebComponentPlaceholder extends Comment {
  /**
   * Returns the actual node or the placeholder depending on the item type.
   */
  static actualOf(item: unknown): Node | null {
    if (item instanceof WebTempFragment) return WebComponentPlaceholder.actualOf(item.target)
    if (item instanceof WebComponentPlaceholder) return item.actual
    if (item instanceof Node) return item
    return null
  }

  /**
   * Returns the actual node to be used.
   */
  get actual(): Node | null {
    const shellView = this.shell.getView()
    if (!shellView) return this
    if (shellView instanceof Node) return WebComponentPlaceholder.actualOf(shellView)
    return null
  }

  constructor(public shell: ProtonShell, shellConstructor: Function) {
    super(shellConstructor.name)
  }

  protected safeActualParentElement(): Element | null {
    const actual = this.actual
    if (actual === this) return null
    return actual?.parentElement ?? null
  }

  override get parentElement(): Element | null {
    const element = super.parentElement ?? this.safeActualParentElement()
    if (element == null) {
      const shellView = this.shell.getView()
      return shellView instanceof Node ? shellView.parentElement : null
    }
    return element
  }
}

class WebTempFragment extends DocumentFragment {
  declare target: Node
}

// function resolveReplacement(value: any): any {
//   if (value?.replacedWith) return resolveReplacement(value.replacedWith)
//   return value
// }
