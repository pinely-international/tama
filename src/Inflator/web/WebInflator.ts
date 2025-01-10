import { Primitive } from "type-fest"

import Accessor, { AccessorGet } from "@/Accessor"
import Observable from "@/Observable"
import { ProtonShell } from "@/Proton/ProtonShell"
import ProtonJSX from "@/ProtonJSX"
import { isRecord } from "@/utils/general"
import WebNodeBinding from "@/utils/WebNodeBinding"

import { NAMESPACE_MATH, NAMESPACE_SVG } from "./consts"
import { isNode, nonGuard } from "./helpers"
import WebComponentPlaceholder from "./WebComponentPlaceholder"
import WebMountPlaceholder from "./WebMountPlaceholder"

import Inflator from "../Inflator"


type WebInflateResult<T> =
  T extends Node ? T :
  T extends JSX.Element ? (Element | WebComponentPlaceholder) :
  T extends Observable<unknown> ? Text :
  T extends Primitive ? Text :
  Text

class WebInflator extends Inflator {
  protected clone() { return new WebInflator }

  public inflate<T>(subject: T): WebInflateResult<T> {
    if (subject instanceof Node) return subject as never
    if (subject instanceof ProtonJSX.Node) return this.inflateJSXDeeply(subject) as never

    return super.inflate(subject) as never
  }
  protected inflatePrimitive(primitive: Primitive): Node {
    return document.createTextNode(String(primitive))
  }

  protected inflateFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  protected inflateJSX(jsx: ProtonJSX.Node): HTMLElement | DocumentFragment | Node {
    if (jsx instanceof ProtonJSX.Intrinsic) return this.inflateJSXIntrinsic(jsx)
    if (jsx instanceof ProtonJSX.Component) return this.inflateJSXComponent(jsx)
    if (jsx instanceof ProtonJSX.Fragment) return this.inflateFragment()

    throw new TypeError("Unsupported type of `jsx`", { cause: { jsx } })
  }

  protected inflateObservable<T>(observable: Observable<T> & AccessorGet<T>) {
    const textNode = document.createTextNode(String(observable.get?.()))

    observable[Symbol.subscribe](value => textNode.textContent = String(observable.get?.() ?? value))

    return textNode
  }

  protected bindStyle(style: unknown, element: ElementCSSInlineStyle) {
    if (isRecord(style)) {
      for (const property in style) {
        this.bindProperty(property, style[property], element.style)
      }

      return
    }

    this.bindPropertyCallback(style, value => element.style.cssText = String(value))
  }

  private inflateJSXDeeply(jsx: ProtonJSX.Node): HTMLElement | DocumentFragment | Node {
    const inflated = this.inflateJSX(jsx)
    // Inflation of Component children is handled by the component itself.
    if (jsx instanceof ProtonJSX.Component) return inflated

    return this.inflateJSXIntrinsicDeeply(jsx, inflated)
  }

  private inflateJSXIntrinsicDeeply(jsx: ProtonJSX.Intrinsic | ProtonJSX.Fragment, inflated: Node): HTMLElement | DocumentFragment | Node {
    const appendChildObject = (child: ProtonJSX.Node | Primitive) => {
      const childInflated = this.inflate(child)
      if (!isNode(childInflated)) return

      try {
        inflated.appendChild(childInflated)
      } catch (error) {
        console.debug("appendChildObject -> ", child, childInflated)
        console.trace(error)
        throw error
      }
    }

    if (jsx.children instanceof Array === false) appendChildObject(jsx.children)

    if (jsx.children instanceof Array) jsx.children.forEach(appendChildObject)
    if (jsx.childrenExtrinsic != null) jsx.childrenExtrinsic.forEach(appendChildObject)

    if (inflated instanceof DocumentFragment) {
      // @ts-expect-error by design.
      inflated.fixedNodes = [...inflated.childNodes]
    }

    return inflated
  }

  protected inflateElement(type: string, namespaceOverride?: string) {
    if (namespaceOverride != null) return document.createElementNS(type, namespaceOverride)

    if (NAMESPACE_SVG.has(type)) return document.createElementNS("http://www.w3.org/2000/svg", type)
    if (NAMESPACE_MATH.has(type)) return document.createElementNS("http://www.w3.org/1998/Math/MathML", type)

    return document.createElement(type)
  }

  private inflateJSXIntrinsic(intrinsic: ProtonJSX.Intrinsic): Element | WebMountPlaceholder {
    if (typeof intrinsic.type !== "string") {
      throw new TypeError(typeof intrinsic.type + " type of intrinsic element is not supported", { cause: { type: intrinsic.type } })
    }

    const inflated = this.inflateElement(intrinsic.type, intrinsic.props.ns)
    if (intrinsic.props == null) return inflated

    try {
      const properties = Object.entries(intrinsic.props)
      const overridden = this.bindSpecialProperties(intrinsic.props, inflated)

      for (const [key, value] of properties) {
        if (key === "children") continue
        if (overridden.has(key)) continue

        this.bindProperty(key, value, inflated)
      }

      const immediateGuard = this.applyGuardMounting(inflated, properties, intrinsic.type)
      if (immediateGuard != null) return immediateGuard
    } catch (error) {
      console.error("Element props binding failed -> ", error)
    }

    return inflated
  }

  protected applyGuardMounting(element: Element, properties: [string, unknown][], type: string) {
    let mountPlaceholder: WebMountPlaceholder | null = null

    function toggleMount(condition: unknown) {
      if (condition) {
        if (!mountPlaceholder!.isConnected) return
        mountPlaceholder!.replaceWith(element)
      } else {
        if (!element.isConnected) return
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
        mountPlaceholder = new WebMountPlaceholder(element, type)
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

  protected bindEventListeners(listeners: any, element: Element) {
    // @ts-expect-error by design.
    const catchCallback = this.shell?.catchCallback

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
  protected bindSpecialProperties(properties: any, element: Element): Set<string> {
    const overrides = new Set<string>()

    if (isRecord(properties.on)) {
      this.bindEventListeners(properties.on, element)
      overrides.add("on")
    }

    if (element instanceof HTMLElement && "style" in properties) {
      this.bindStyle(properties.style, element)
      overrides.add("style")
    }

    if (element instanceof SVGElement) {
      if (properties.class != null) {
        this.bindPropertyCallback(properties.class, value => element.setAttribute("class", String(value)))
        overrides.add("class")
      }
    }

    if (element instanceof SVGUseElement) {
      this.bindPropertyCallback(properties.href, (href: any) => {
        if (typeof href === "string") element.href.baseVal = href
        if (typeof href === "object") element.href.baseVal = href.baseVal
      })

      overrides.add("href")
    }
    if (element instanceof HTMLInputElement) {
      // Ensures correct type beforehand.
      this.bindProperty("type", properties.type, element)

      WebNodeBinding.dualSignalBind(element, "valueAsDate", properties.valueAsDate, "input")
      WebNodeBinding.dualSignalBind(element, "valueAsNumber", properties.valueAsNumber, "input")

      overrides.add("type").add("valueAsDate").add("valueAsNumber")
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      WebNodeBinding.dualSignalBind(element, "value", properties.value, "input")
      overrides.add("value")
    }
    if (element instanceof HTMLSelectElement) {
      WebNodeBinding.dualSignalBind(element, "value", properties.value, "change")
      overrides.add("value")
    }

    return overrides
  }

  protected bindProperty(key: keyof never, value: unknown, target: unknown): void {
    this.bindPropertyCallback(value, value => (target as any)[key] = value)
  }

  protected bindPropertyCallback(source: unknown, targetBindCallback: (value: unknown) => void): void {
    if (typeof source === "string" || typeof source === "number" || typeof source === "boolean" || typeof source === "bigint") {
      targetBindCallback(source)
      return
    }

    const accessor = Accessor.extractObservable(source)
    if (accessor == null) return
    if (accessor.get == null && accessor.subscribe == null) return

    if (accessor.get) targetBindCallback(accessor.get())
    if (accessor.subscribe) accessor.subscribe(value => targetBindCallback(accessor.get!() ?? value))
  }

  protected inflateJSXComponent(component: ProtonJSX.Component) {
    // if (component.type.prototype == null) { // Assume it's arrow function.
    //   return this.inflate(component.type(component.props))
    // }

    const shell = new ProtonShell(this, this.shell)
    const componentPlaceholder = new WebComponentPlaceholder(shell, component.type)

    let currentView: Node = componentPlaceholder
    let lastAnimationFrame = -1

    const schedule = (nextView: Node) => {
      if (nextView instanceof WebComponentPlaceholder) {
        // @ts-expect-error by design.
        nextView = nextView?.shell.getView() ?? nextView
      }
      currentView = resolveReplacement(currentView)

      if ("replaceWith" in currentView && currentView.replaceWith instanceof Function) {
        if (currentView.isConnected) {
          currentView.replaceWith(nextView)
        }

        // @ts-expect-error by design.
        currentView.replacedWith = nextView
        // @ts-expect-error by design.
        nextView.replacedWith = null

        currentView = nextView

        return
      }

      if (currentView instanceof DocumentFragment) {
        // @ts-expect-error by design.
        const f = currentView.fixedNodes as Node[]
        const fixedNodes = f.map(node => WebComponentPlaceholder.actualOf(node) ?? node)

        const anchor = fixedNodes[0]

        if (anchor.isConnected) {
          anchor.parentElement?.replaceChild(nextView, anchor)
        }
        currentView.replaceChildren(...fixedNodes)

        // @ts-expect-error by design.
        currentView.replacedWith = nextView
        // @ts-expect-error by design.
        nextView.replacedWith = null

        currentView = nextView

        if (anchor instanceof WebComponentPlaceholder) {
          // @ts-expect-error no another way.
          anchor.shell.events.dispatch("unmount")
        }

        return
      }

      throw new Error("Couldn't update view")
    }

    shell.on("view").subscribe(view => {
      if (view === null) view = componentPlaceholder
      if (view instanceof Node === false) return

      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => schedule(view))
    })

    ProtonShell.evaluate(shell, component.type, component.props)

    return componentPlaceholder
  }
}

export default WebInflator


function resolveReplacement(value: any): any {
  if (value == null) return value
  if (value.replacedWith == null) return value
  if (value === value.replacedWith) return value

  return resolveReplacement(value.replacedWith)
}
