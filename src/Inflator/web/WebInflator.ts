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
  protected inflatePrimitive(primitive: Primitive): Text {
    return new Text(String(primitive))
  }

  protected inflateFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  public inflateJSX(jsx: ProtonJSX.Node): Element | DocumentFragment | Node {
    if (jsx instanceof ProtonJSX.Intrinsic) return this.inflateIntrinsic(jsx.type, jsx.props)
    if (jsx instanceof ProtonJSX.Component) return this.inflateComponent(jsx.type, jsx.props)
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

  private inflateJSXDeeply(jsx: ProtonJSX.Node): Element | DocumentFragment | Node {
    const inflated = this.inflateJSX(jsx)
    // Inflation of Component children is handled by the component itself.
    if (jsx instanceof ProtonJSX.Component) return inflated

    return this.inflateJSXIntrinsicDeeply(jsx, inflated)
  }

  private inflateJSXIntrinsicDeeply(jsx: ProtonJSX.Intrinsic | ProtonJSX.Fragment, inflated: Node): Element | DocumentFragment | Node {
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

  public inflateIntrinsic(type: unknown, props?: any): Element | WebMountPlaceholder {
    if (typeof type !== "string") {
      throw new TypeError(typeof type + " type of intrinsic element is not supported", { cause: { type: type } })
    }

    const inflated = this.inflateElement(type, props.ns)
    if (props == null) return inflated

    try {
      const properties = Object.entries(props)
      const overridden = this.bindSpecialProperties(props, inflated)

      for (const [key, value] of properties) {
        if (key === "children") continue
        if (overridden.has(key)) continue

        this.bindProperty(key, value, inflated)
      }

      const immediateGuard = this.applyGuardMounting(inflated, properties, type)
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
        mountPlaceholder.toBeReplacedWith = element

        if (mountPlaceholder?.parentElement == null) return
        mountPlaceholder!.replaceWith(element)

        mountPlaceholder.toBeReplacedWith = null
      } else {
        element.toBeReplacedWith = mountPlaceholder

        if (element.parentElement == null) return
        element.replaceWith(mountPlaceholder!)

        element.toBeReplacedWith = null
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

  public inflateComponent(type: Function, props?: any) {
    // if (component.type.prototype == null) { // Assume it's arrow function.
    //   return this.inflate(component.type(component.props))
    // }

    const shell = new ProtonShell(this, this.shell)
    const componentPlaceholder = new WebComponentPlaceholder(shell, type)

    let currentView: Node = componentPlaceholder
    let lastAnimationFrame = -1

    const replace = (view: unknown) => {
      let nextView = view
      if (view === null) {
        nextView = componentPlaceholder
        // @ts-expect-error by design.
        nextView.replacedWith = null
      }
      if (nextView instanceof Node === false) return


      // if (nextView instanceof WebComponentPlaceholder === false) {
      //   // @ts-expect-error by design.
      //   nextView = nextView?.shell?.getView?.() ?? nextView
      // }
      // let actualNextView = WebComponentPlaceholder.actualOf(nextView) ?? nextView
      let actualNextView = nextView
      if (actualNextView.toBeReplacedWith != null) {
        const toBeReplacedWith = actualNextView.toBeReplacedWith

        actualNextView.toBeReplacedWith = null
        actualNextView = toBeReplacedWith
      }

      currentView = resolveReplacement(currentView)
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

        // if (currentView instanceof WebComponentPlaceholder === false) {
        //   currentView.shell = null
        // }
        // if (nextView instanceof WebComponentPlaceholder === false) {
        //   nextView.shell = shell
        // }

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

        if (currentView.parentNode != null) {
          anchor.parentElement?.replaceChild(actualNextView, anchor)
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

        // if (currentView instanceof WebComponentPlaceholder === false) {
        //   currentView.shell = null
        // }
        // if (nextView instanceof WebComponentPlaceholder === false) {
        //   nextView.shell = shell
        // }
        currentView = nextView

        if (anchor instanceof WebComponentPlaceholder) {
          // @ts-expect-error no another way.
          anchor.shell.events.dispatch("unmount")
        }

        return
      }
    }

    shell.on("view").subscribe(view => {
      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => replace(view))
    })

    ProtonShell.evaluate(shell, type, props)

    return componentPlaceholder
  }
}

export default WebInflator

// const asd = new WebInflator
// const element = asd.inflateIntrinsic("div", { mounted: false })
// asd.inflateJSX(<p>123</p>)


function resolveReplacement(value: any): any {
  if (value == null) return value
  if (value.replacedWith == null) return value
  if (value === value.replacedWith) return value

  return resolveReplacement(value.replacedWith)
}


// interface WebInflateChunk<T> {
//   view: T
// }

// interface WebInflateChunkComponent<T> extends WebInflateChunk<T> {
//   shell: ProtonShell
// }
