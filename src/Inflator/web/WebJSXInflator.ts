import Null from "@/Null"

interface JSN {
  tag: string
  attributes?: Record<string, unknown>
  listeners?: { [K in keyof GlobalEventHandlersEventMap]: EventListenerOrEventListenerObject }
  children?: Iterable<JSN>
}

export function inflateElement(jsn: JSN, hook: (node: Node, jsn: JSN) => void, doc = document): Node {
  // Base cases
  if (jsn == null) return doc.createTextNode("") // null/undefined -> empty text
  if (typeof jsn === "string" || typeof jsn === "number" || typeof jsn === "bigint") {
    return doc.createTextNode(String(jsn))
  }
  if (jsn instanceof Node) return jsn

  // Expect object { tag, attributes, listeners, children }
  if (typeof jsn === "object") {
    const tag = jsn.tag || "div"
    const element = createElement(tag)
    // Event handlers starting with "on" and value is function
    if (jsn.listeners != null) {
      for (const [eventName, value] of Object.entries(jsn.listeners)) {
        element.addEventListener(eventName, value)
      }
    }
    // Attributes/properties handling
    const attrs = jsn.attributes ?? Null.OBJECT
    for (const [rawKey, rawValue] of Object.entries(attrs)) {
      const value = rawValue
      if (value == null) {
        // skip null/undefined (intentional removal can be done by explicit hook)
        continue
      }

      // Class handling
      if (rawKey === "className" || rawKey === "class") {
        element.setAttribute("class", String(value))
        continue
      }

      // Style object handling
      if (rawKey === "style" && typeof value === "object") {
        // set style properties individually
        for (const [k, v] of Object.entries(value)) {
          if (v == null) continue
          try {
            // Prefer setting via style property for better performance
            element.style[k] = v
          } catch {
            // fallback to setProperty for hyphenated names
            try { element.style.setProperty(k, v) } catch { /* ignore */ }
          }
        }
        continue
      }

      // dataset handling: attributes starting with 'data' and a camelCase key
      if (rawKey.startsWith("data") && rawKey.length > 4 && rawKey[4] === rawKey[4].toUpperCase()) {
        // camelCase to data-*
        const dataKey = rawKey.slice(4).replace(/([A-Z])/g, "-$1").toLowerCase()
        element.setAttribute("data-" + dataKey, String(value))
        continue
      }

      // Boolean attributes (e.g., disabled, checked)
      if (typeof value === "boolean") {
        if (value) {
          element.setAttribute(rawKey, "")
          // also set property if available for reflect
          try { element[rawKey] = true } catch (e) { }
        } else {
          // Ensure attribute not present
          if (element.hasAttribute(rawKey)) element.removeAttribute(rawKey)
          try { element[rawKey] = false } catch (e) { }
        }
        continue
      }

      // For "value" and other common reflected properties, try property set first
      if (rawKey in element && (typeof value !== "object")) {
        try {
          element[rawKey] = value
          // still set attribute for consistent serialization if not a function
          if (typeof value !== "function") element.setAttribute(rawKey, String(value))
          continue
        } catch (e) {
          // fall through to setAttribute
        }
      }

      // Fallback: set attribute (strings, numbers)
      try {
        element.setAttribute(rawKey, String(value))
      } catch (e) {
        // ignore attributes that cannot be set
      }
    }

    // Call hook; if it returns false, skip children
    if (typeof hook === "function") {
      const r = hook(element, jsn)
      if (r === false) return element
    }

    // Children: array or single child; build into a fragment
    const children = jsn.children ?? jsn.childNodes ?? []
    if (children != null) {
      const frag = doc.createDocumentFragment()
      if (children instanceof Object && Symbol.iterator in children) {
        for (const child of children) {
          frag.appendChild(inflateElement(child, hook, doc))
        }
      } else {
        // single child
        frag.appendChild(inflateElement(children, hook, doc))
      }
      element.appendChild(frag)
    }

    return element
  }

  // Fallback: toString and make text node
  return doc.createTextNode(String(jsn))
}


// Helper: create element, using namespace for svg and children detection
function createElement(tag: string) {
  if (!tag) return document.createElement("div")
  // Quick check for svg context: if tag is 'svg' or inside svg we might need namespace
  // If tag equals 'svg' or tag contains ':' assume namespace for safety for common svg
  if (tag === "svg" || tag === "path" || tag === "g" || tag === "rect" || tag === "circle" || /:/.test(tag)) {
    // If tag is 'svg' or common SVG tag, create in SVG namespace
    return document.createElementNS("http://www.w3.org/2000/svg", tag)
  }
  return document.createElement(tag)
}
