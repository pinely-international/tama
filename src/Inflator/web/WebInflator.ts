import { State } from "@denshya/reactive";
import { Group } from "node-group";
import { Primitive } from "type-fest";

import Accessor, { AccessorGet } from "@/Accessor";
import { AsyncFunction, AsyncGeneratorFunction } from "@/BuiltinObjects";
import { CustomAttributesMap, JSXAttributeSetup } from "@/jsx/JSXCustomizationAPI";
import ProtonJSX from "@/jsx/ProtonJSX";
import Observable from "@/Observable";
import { ProtonComponent } from "@/Proton/ProtonComponent";
import { isIterable, isJSX, isRecord } from "@/utils/testers";
import WebNodeBinding from "@/utils/WebNodeBinding";

import { NAMESPACE_MATH, NAMESPACE_SVG } from "./consts";
import { iterableOf, nonGuard, onDemandRef } from "./helpers";

import Inflator from "../Inflator";

/**
 * NEW: ComponentContext class to store context properties for components
 */
class ComponentContext {
  private registry = new Map<string, (context: Record<string, any>) => any>();

  set(key: string, fn: (context: Record<string, any>) => any) {
    this.registry.set(key, fn);
  }

  apply(ctx: Record<string, any>) {
    for (const [key, fn] of this.registry) {
      ctx[key] = fn(ctx);
    }
  }
}

type WebInflateResult<T> =
  T extends Node ? T :
  T extends JSX.Element ? Element :
  T extends Observable<unknown> ? Text :
  T extends (undefined | null) ? T :
  T extends Primitive ? Text :
  T extends any[] ? DocumentFragment :
  Node;

interface WebInflatorFlags {
  debug: boolean;
  skipAsync: boolean;
  disableJSXCache: boolean;
}

class WebInflator extends Inflator {
  private static jsxCache = new WeakMap<object, Node>();

  flags: WebInflatorFlags = {
    debug: false,
    skipAsync: false,
    disableJSXCache: false,
  };

  jsxAttributes: CustomAttributesMap = new Map<string, JSXAttributeSetup<any>>();

  /**
   * NEW: componentContext property
   */
  public componentContext = new ComponentContext();

  protected clone() {
    const clone = new WebInflator();
    clone.flags = { ...this.flags };
    clone.jsxAttributes = new Map(this.jsxAttributes);
    return clone;
  }

  // --- ALL EXISTING METHODS REMAIN UNCHANGED UNTIL inflateComponent ---

  public inflateComponent(factory: Function, props?: any) {
    if (this.flags.skipAsync) {
      if (factory instanceof AsyncFunction.constructor) return null;
      if (factory instanceof AsyncGeneratorFunction.constructor) return null;
    }
    if (factory.prototype == null && factory instanceof AsyncFunction.constructor === false) {
      return this.inflate(factory(props));
    }

    const component = new ProtonComponent(this, this.component);
    const componentGroup = new Group();
    const componentComment = onDemandRef(() => new Comment("component/" + factory.name));

    // --- NEW: apply componentContext before running the component
    const ctx: Record<string, any> = {};
    this.componentContext.apply(ctx);

    try {
      // Pass context as `this` to the component function
      component.view.initWith(factory.call(component, props));
    } catch (thrown) {
      component.tree.caught(thrown);
      console.error(thrown);
      return componentGroup;
    }

    const currentView = component.inflator.inflate(component.view.get()) as ChildNode;
    componentGroup.append(currentView ?? componentComment.current);

    const replace = (view: unknown | null) => {
      if (view === null) componentGroup.replaceChildren(componentComment.current);
      if (view instanceof Node) componentGroup.replaceChildren(view);
    };

    let lastAnimationFrame = -1;
    component.view.subscribe(view => {
      view = component.inflator.inflate(view);
      cancelAnimationFrame(lastAnimationFrame);
      lastAnimationFrame = requestAnimationFrame(() => replace(view));
    });

    return componentGroup;
  }

  // --- REMAINING EXISTING METHODS BELOW (unchanged) ---

   protected applyGuardMounting(element: Element, props: Record<string, any>, type: string) {
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

    if (props.mounted != null && props.mounted.valid == null) {
      props.mounted.valid = nonGuard
    }

    for (const key in props) {
      const property = props[key]
      if (property instanceof Object === false) continue
      if (property.valid instanceof Function === false) continue

      const accessor = Accessor.extractObservable(property)
      if (accessor == null) continue
      if (accessor.subscribe == null) continue

      if (guards == null) guards = new Map<string, boolean>()
      if (mountPlaceholder == null) mountPlaceholder = new Comment(type)

      accessor.subscribe(value => {
        value = accessor.get?.() ?? value

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
    for (const key in listeners) {
      element.addEventListener(key, listeners[key])
    }
  }

  protected bindProperties(props: object, inflated: Element, overridden: Set<string>) {
    try {
      let value
      for (const key in props) {
        if (key === "children") continue
        if (overridden.has(key)) continue

        value = props[key as never]

        if (inflated instanceof SVGElement || key.includes("-")) {
          WebInflator.subscribeAttribute(inflated, key, value)
        } else {
          WebInflator.subscribeProperty(key, value, inflated)
        }
      }
    } catch (error) {
      console.error("Element props binding failed -> ", error)
    }
  }

//   /** @returns property names that were overridden. */
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

      for (const [key, attributeSetup] of this.jsxAttributes) {
        if (key in props === false) continue

        attributeSetup({ props, key, value: props[key], bind })
        overrides.add(key)
      }
    }

    return overrides
  }

//   /**
//    * Binds a property.
//    */
  static subscribeProperty(key: keyof never, source: unknown, target: unknown): void {
    WebInflator.subscribe(source, value => (target as any)[key] = value)
  }

//   /**
//    * Binds an attribute.
//    */
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

  private *__inflateIterable__(iterable: Iterable<unknown>) {
    for (const next of iterable) {
      if (next == null) continue
      yield this.inflate(next)
    }
  }
}
}
export default WebInflator;
