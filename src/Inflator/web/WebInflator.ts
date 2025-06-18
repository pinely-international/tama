import { State } from "@denshya/reactive"
import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "@/Accessor"
import { AsyncFunction, AsyncGeneratorFunction } from "@/BuiltinObjects"
import Group from "@/Group"
import { CustomAttributesMap, JSXAttributeSetup } from "@/jsx/JSXCustomizationAPI"
import ProtonJSX from "@/jsx/ProtonJSX"
import Observable from "@/Observable"
import { ProtonComponent } from "@/Proton/ProtonComponent"
import { isIterable, isJSX, isRecord } from "@/utils/testers"
import WebNodeBinding from "@/utils/WebNodeBinding"

import { NAMESPACE_MATH, NAMESPACE_SVG } from "./consts"
import { nonGuard } from "./helpers"

import Inflator from "../Inflator"


type WebInflateResult<T> =
  T extends Node ? T :
  T extends JSX.Element ? Element :
  T extends Observable<unknown> ? Text :
  T extends (undefined | null) ? T :
  T extends Primitive ? Text :
  T extends any[] ? DocumentFragment :
  Node


interface WebInflatorFlags {
  debug: boolean,
  skipAsync: boolean
}

class WebInflator extends Inflator {
  private static jsxCache = new WeakMap<object, Node>

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

  public inflate<T>(subject: T): WebInflateResult<T> {
    if (subject instanceof Node) return subject as never
    if (isJSX(subject)) return this.inflateJSXDeeply(subject) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Text {
    return new Text(String(primitive))
  }

  protected inflateFragment() {
    return new Group
  }

  public inflateJSX(jsx: JSX.Element): Node {
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

  protected inflateObservable<T>(observable: Observable<T> & Partial<AccessorGet<T>>) {
    const value = observable.get?.()

    if (isJSX(value)) return this.inflateObservableJSX(observable as never)
    if (isIterable(value)) return this.inflateIterable(observable as never)

    return this.inflateObservableText(observable)
  }

  protected inflateObservableText<T>(observable: Observable<T> & Partial<AccessorGet<T>>) {
    const value = observable.get?.()
    const textNode = new Text(String(value))

    observable[Symbol.subscribe](value => textNode.textContent = String(observable.get?.() ?? value))

    return textNode
  }

  protected inflateObservableJSX<T extends JSX.Element>(observable: Observable<T> & Partial<AccessorGet<T>>) {
    const value = observable.get?.()
    const element = this.inflateJSXDeeply(value as never)
    observable[Symbol.subscribe]?.(value => (element as ChildNode).replaceWith?.(this.inflate(value)))
    return element
  }

  protected inflateIterable<T>(iterable: (IteratorObject<T> & Partial<Observable<IteratorObject<T>>>)): unknown {
    const iterableGroup = new Group
    const iterableComment = onDemandRef(() => new Comment("iterable/" + iterable.constructor.name))

    const inflateItem = (item: unknown) => this.inflate(item)

    replace(iterableOf(iterable))

    function replace(otherIterable: IteratorObject<T> & Partial<Observable<IteratorObject<T>>>) {
      const nodes = otherIterable[Symbol.iterator]().filter(Boolean).map(inflateItem).toArray()
      if (nodes.length > 0) {
        iterableGroup.replaceChildren(...nodes) // Previous nodes will be lost at this point.
      } else {
        iterableGroup.replaceChildren(iterableComment.current)
      }
    }

    iterable[Symbol.subscribe]?.(replace)
    return iterableGroup
  }
  protected inflateAsyncIterable<T>(asyncIterable: AsyncIteratorObject<T>): unknown {
    throw new TypeError("Async Iterator is not supported", { cause: { asyncIterable } })
  }

  private inflateJSXDeeply(jsx: JSX.Element): Element | DocumentFragment | Node {
    const inflatedCached = WebInflator.jsxCache.get(jsx)
    if (inflatedCached != null) return inflatedCached

    const inflated = this.inflateJSX(jsx)
    WebInflator.jsxCache.set(jsx, inflated)
    // Inflation of Component children is handled by the component itself.
    if (jsx instanceof ProtonJSX.Component) return inflated

    this.inflateJSXChildren(jsx, inflated)

    return inflated
  }

  private inflateJSXChildren(jsx: JSX.Element, inflated: Node): void {
    if (jsx.props?.children == null) return

    // const layout: (Node | void)[] = []

    // @ts-expect-error 123
    const actualInflated = inflated instanceof Comment ? inflated.inflated : inflated
    // actualInflated.fixedLayout = layout


    const appendChildObject = (child: JSX.Element | Primitive) => {
      const childInflated = this.inflate(child)
      if (childInflated instanceof Node === false) return

      // layout[index] = childInflated

      try {
        actualInflated.append(childInflated)
      } catch (error) {
        console.debug("appendChildObject -> ", child, childInflated)
        console.trace(error)
        throw error
      }
    }

    if (jsx.props.children instanceof Array === false) appendChildObject(jsx.props.children)
    if (jsx.props.children instanceof Array) jsx.props.children.forEach(appendChildObject)
  }

  protected inflateElement(type: string, options?: { namespace?: string, is?: string }) {
    if (options?.namespace != null) return document.createElementNS(options.namespace, type, options)

    if (NAMESPACE_SVG.has(type)) return document.createElementNS("http://www.w3.org/2000/svg", type, options)
    if (NAMESPACE_MATH.has(type)) return document.createElementNS("http://www.w3.org/1998/Math/MathML", type, options)

    return document.createElement(type, options)
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

        if (key.includes("-")) {
          WebInflator.subscribeAttribute(inflated, key, value)
        } else {
          WebInflator.subscribeProperty(key, value, inflated)
        }
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
    // If arrow function, simplify inflation.
    if (factory.prototype == null && factory instanceof AsyncFunction.constructor === false) {
      return this.inflate(factory(props))
    }

    const component = new ProtonComponent(this, this.component)

    const componentGroup = new Group
    const componentComment = onDemandRef(() => new Comment("component/" + factory.name))


    try {
      ProtonComponent.evaluate(component, factory, props)
    } catch (error) {
      console.error(error)
      return this.inflate(error)
    }


    const currentView = component.getView() as ChildNode
    componentGroup.append(currentView ?? componentComment.current)

    const replace = (view: unknown | null) => {
      if (view === null) componentGroup.replaceChildren(componentComment.current)
      if (view instanceof Node) componentGroup.replaceChildren(view)
    }


    let lastAnimationFrame = -1
    component.when("view").subscribe(view => {
      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => replace(view))
    })

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
        if (property.startsWith("--")) {
          WebInflator.subscribe(style[property], value => element.style.setProperty(property, String(value)))
          continue
        }

        WebInflator.subscribeProperty(property, style[property], element.style)
      }

      return
    }

    WebInflator.subscribe(style, value => element.style.cssText = String(value))
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
        WebInflator.subscribeProperty(key, props.aria[key], element)
      }
      overrides.add("aria")
    }

    if (element instanceof SVGElement) {
      if (props.class != null) {
        WebInflator.subscribe(props.class, value => element.setAttribute("class", String(value)))
        overrides.add("class")
      }

      if (props.href != null) {
        WebInflator.subscribe(props.href, (href: any) => {
          if (typeof href === "string") element.setAttribute("href", href)
          if (typeof href === "object") element.setAttribute("href", href.baseVal)
        })

        overrides.add("href")
      }
    }

    if (element instanceof HTMLInputElement) {
      // Ensures correct type beforehand.
      WebInflator.subscribeProperty("type", props.type, element)

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
        WebInflator.subscribeProperty(key, value, element)
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
   * Binds a property.
   */
  static subscribeProperty(key: keyof never, source: unknown, target: unknown): void {
    WebInflator.subscribe(source, value => (target as any)[key] = value)
  }

  /**
   * Binds an attribute.
   */
  static subscribeAttribute(target: Element, key: string, value: unknown): void {
    WebInflator.subscribe(value, value => {
      if (value != null) {
        target.setAttribute(key, String(value))
      } else {
        target.removeAttribute(key)
      }
    })
  }

  protected static subscribe(source: unknown, targetBindCallback: (value: unknown) => void): void {
    if (source == null) return
    return void State.subscribeImmediate(source, targetBindCallback)
  }
}

export default WebInflator

function iterableOf(object: object) {
  if (Symbol.iterator in object) return object
  if ("get" in object && object.get instanceof Function) {
    const value = object.get()
    if (Symbol.iterator in value) return value
  }

  throw new TypeError("Unreachable code reached during extract of iterable from observable")
}



/**
 * Creates reference only when it's first accessed.
 */
function onDemandRef<T>(factory: () => T) {
  let value: T | null = null

  return {
    get current() {
      if (value === null) value = factory()
      return value
    }
  }
}
