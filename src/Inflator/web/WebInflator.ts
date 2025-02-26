import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "@/Accessor"
import { CustomAttributesMap, JSXAttributeSetup } from "@/jsx/JSXCustomizationAPI"
import ProtonJSX from "@/jsx/ProtonJSX"
import Observable from "@/Observable"
import { ProtonComponent } from "@/Proton/ProtonComponent"
import { isRecord } from "@/utils/general"
import WebNodeBinding from "@/utils/WebNodeBinding"

import { NAMESPACE_MATH, NAMESPACE_SVG } from "./consts"
import { isNode, nonGuard } from "./helpers"

import Inflator from "../Inflator"


type WebInflateResult<T> =
  T extends Node ? T :
  T extends JSX.Element ? Element :
  T extends Observable<unknown> ? Text :
  T extends Primitive ? Text :
  Text


interface WebInflatorFlags {
  debug: boolean
}

class WebInflator extends Inflator {
  flags: WebInflatorFlags = {
    debug: false,
  }
  /** Custom JSX attributes. Adds or Overrides JSX attribute to provide new behavior. */
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
    if (subject instanceof ProtonJSX.Node) return this.inflateJSXDeeply(subject) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Text {
    return new Text(String(primitive))
  }

  protected inflateFragment() {
    return this.inflateGroup("fragment", this.component?.factory?.name ?? "[unknown]")
  }

  public inflateJSX(jsx: ProtonJSX.Node): Node {
    if (jsx instanceof ProtonJSX.Intrinsic) return this.inflateIntrinsic(jsx.type, jsx.props)
    if (jsx instanceof ProtonJSX.Component) return this.inflateComponent(jsx.type, jsx.props)
    if (jsx instanceof ProtonJSX.Fragment) return this.inflateFragment()

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

    if (jsx.children instanceof Array === false) appendChildObject(jsx.children)

    if (jsx.children instanceof Array) jsx.children.forEach(appendChildObject)
    if (jsx.childrenExtrinsic != null) jsx.childrenExtrinsic.forEach(appendChildObject)
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

    const inflated = this.inflateElement(type, props.ns)
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
    // If arrow function, simplify inflation.
    if (factory.prototype == null && factory instanceof AsyncFunction === false) {
      return this.inflate(factory(props))
    }

    const componentGroup = this.inflateGroup("component", factory.name)

    const replace = (view: unknown) => {
      if (view === null) componentGroup.replaceChildren()
      if (view instanceof Node) componentGroup.replaceChildren(view)
    }


    let lastAnimationFrame = -1
    const component = new ProtonComponent(this, this.component)
    component.on("view").subscribe(view => {
      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => replace(view))
    })
    ProtonComponent.evaluate(component, factory, props)

    return componentGroup
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

    if (element instanceof SVGElement) {
      if (props.class != null) {
        WebInflator.bindPropertyCallback(props.class, value => element.setAttribute("class", String(value)))
        overrides.add("class")
      }
    }

    if (element instanceof SVGUseElement) {
      WebInflator.bindPropertyCallback(props.href, (href: any) => {
        if (typeof href === "string") element.href.baseVal = href
        if (typeof href === "object") element.href.baseVal = href.baseVal
      })

      overrides.add("href")
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

        attributeSetup({ props, key, value: props[key], element, bind })
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
    if (accessor.subscribe) accessor.subscribe(value => targetBindCallback(accessor.get!() ?? value))
  }
}

export default WebInflator


const AsyncFunction = (async () => { }).constructor
