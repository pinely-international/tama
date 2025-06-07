import "./dom"

import { describe, it, expect, beforeEach } from "bun:test"
import { WebInflator } from "../build"
import { injectDOMPolyfill } from "./dom"

import { State, StateArray } from "@denshya/reactive"




describe("WebInflator", () => {
  let inflator: WebInflator

  beforeEach(() => {
    injectDOMPolyfill(globalThis)
    inflator = new WebInflator
  })

  it("inflates primitives to Text nodes", () => {
    function expectTextNode(subject: unknown) {
      const node = inflator.inflate(subject)
      expect(node.nodeType).toBe(Node.TEXT_NODE)
      expect(node.textContent).toBe(String(subject))
    }

    expectTextNode(123)
    expectTextNode(123n)
    expectTextNode("123")
    expectTextNode(true)
    expectTextNode(Symbol.for("subscribe"))
  })

  it("inflates intrinsic JSX elements", () => {
    const element = inflator.inflate(<div className="cls">Hello</div>)

    expect(element.tagName).toBe("DIV")
    expect(element.className).toBe("cls")
    expect(element.textContent).toBe("Hello")
  })

  it("inflates fragments and arrays", () => {
    const frag1 = inflator.inflate(<>A<span>B</span>C</>) as unknown as DocumentFragment
    expect([...frag1.childNodes].map(n => n.textContent)).toEqual(["A", "B", "C"])

    const frag2 = inflator.inflate(["X", <em>Y</em>])
    expect([...frag2.childNodes].map(n => n.textContent)).toEqual(["X", "Y"])
  })

  it("inflates iterable", () => {
    const fragment = inflator.inflate(new Set(["X", <em>Y</em>]))
    expect([...fragment.childNodes].map(n => n.textContent)).toEqual(["X", "Y"])
  })

  it("inflates observable", () => {
    const state = new State("test")

    const text = inflator.inflate(state) as Text
    expect(text.textContent).toBe("test")

    state.set("new")
    expect(text.textContent).toBe("new")
  })

  it("inflates observable iterable", () => {
    const stateIterable = new State(new Set(["test", <em>oh my guy</em>]))

    const group = inflator.inflate(stateIterable)
    expect([...group.childNodes].map(n => n.textContent)).toEqual(["test", "oh my guy"])

    stateIterable.set(new Set(["new", <em>oh yes</em>]))
    expect([...group.childNodes].map(n => n.textContent)).toEqual(["new", "oh yes"])
  })
  it("inflates iterable+observable", () => {
    const stateIterable = new StateArray(["test", <em>oh my guy</em>])

    const group = inflator.inflate(stateIterable)
    expect([...group.childNodes].map(n => n.textContent)).toEqual(["test", "oh my guy"])

    stateIterable.set(["new", <em>oh yes</em>])
    expect([...group.childNodes].map(n => n.textContent)).toEqual(["new", "oh yes"])
  })
  it("throws on async iterable input", () => {
    async function* gen() { yield 1; }
    expect(() => inflator.inflate(gen())).toThrow(TypeError)
  })

  it("inflates async iterable component", async () => {
    async function* AsyncComponent() {
      yield <span>One</span>
      await new Promise(res => setTimeout(res, 25))

      yield <span>Two</span>
      await new Promise(res => setTimeout(res, 25))

      yield <span>Three</span>
      await new Promise(res => setTimeout(res, 25))

      return <span>Return</span>
    }

    const container = document.createElement('div')
    container.append(inflator.inflate(<AsyncComponent />))

    let spans

    spans = container.querySelectorAll('span')
    expect(spans.length).toBe(0)
    expect(container.childNodes[0]).toBeInstanceOf(Comment)

    // after first yield
    await new Promise(r => setTimeout(r, 0))
    spans = container.querySelectorAll('span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent).toBe('One')

    // after second yield
    await new Promise(r => setTimeout(r, 25))
    spans = container.querySelectorAll('span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent).toBe('Two')

    // after third yield
    await new Promise(r => setTimeout(r, 25))
    spans = container.querySelectorAll('span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent).toBe('Three')

    // after return (must append return value)
    await new Promise(r => setTimeout(r, 25))
    spans = container.querySelectorAll('span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent).toBe('Return')
  })

  it("inflates sync/async components", async () => {
    function Sync() { return <p>S</p>; }
    async function Async() { return <p>A</p>; }

    const s = inflator.inflate(<Sync />) as unknown as DocumentFragment
    expect(s.textContent).toBe("S")

    const a = inflator.inflate(<Async />) as unknown as DocumentFragment
    await new Promise(r => setTimeout(r, 0))
    expect(a.textContent).toBe("A")
  })

  it("gracefully shuts down on error in component", () => {
    const ComponentErrored = () => { throw new Error("test") }

    expect(() => inflator.inflate(<ComponentErrored />)).toThrow()
  })

  it("inflates nested components deeply", () => {
    function Comp() { return <strong>Deep</strong> }
    const el = inflator.inflate(<div><Comp /></div>) as HTMLElement
    expect(el.querySelector("strong")?.textContent).toBe("Deep")
  })

  it("creates SVGUse with href", () => {
    const svg = inflator.inflate(<use href={new State("123")} />) as SVGUseElement
    expect(svg.getAttribute("href")).toBe("123")
  })

  // it("creates SVG and MathML in correct namespace", () => {
  //   const svg = inflator.inflate(<svg><circle /></svg>) as SVGSVGElement
  //   expect(svg.namespaceURI).toContain("svg")
  //   expect(svg.querySelector("circle")!.namespaceURI).toContain("svg")

  //   const math = inflator.inflate(<math><mi /></math>) as Element
  //   expect(math.namespaceURI).toContain("mathml")
  // })

  // it("errors on invalid intrinsic types", () => {})

  it("binds data-, aria-, and boolean attributes", () => {
    const input = inflator.inflate(<input disabled data-test="d" aria-label="a" />) as HTMLInputElement

    expect(input.disabled).toBe(true)
    expect(input.getAttribute("data-test")).toBe("d")
    expect(input.getAttribute("aria-label")).toBe("a")
  })

  it("binds observable style string and reacts to changes", () => {
    const styleState = new State("color: red")

    const element = inflator.inflate(<div style={styleState} />) as HTMLElement
    expect(element.style.color).toBe("red")

    styleState.set("color: blue")
    expect(element.style.color).toBe("blue")
  })

  it("binds observable style object property and reacts to changes", () => {
    const color = new State("red")

    const element = inflator.inflate(<div style={{ color }} />) as HTMLElement
    expect(element.style.color).toBe("red")

    color.set("blue")
    expect(element.style.color).toBe("blue")
  })

  // it("binds observable style object and reacts to changes", () => {
  //   const styleState = new State({ color: "red" })

  //   const element = inflator.inflate(<div style={styleState} />) as HTMLElement
  //   expect(element.style.color).toBe("red")

  //   styleState.set({ color: "blue" })
  //   expect(element.style.color).toBe("blue")
  // })

  it("attaches multiple event listeners and preserves native behavior", () => {
    let clicked = false
    let hovered = false

    const button = inflator.inflate(
      <button on={{ click: () => clicked = true, mouseover: () => hovered = true }} />
    ) as HTMLButtonElement

    button.click()
    button.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))

    expect(clicked).toBe(true)
    expect(hovered).toBe(true)
  })

  it("guarded mount/unmount toggles DOM presence and handles rapid toggles", () => {
    document.body.innerHTML = "<div id='root' />"

    const mounted = new State(false)
    const placeholder = inflator.inflate(<span mounted={mounted}>X</span>)
    const root = document.getElementById("root")!
    root.append(placeholder)

    // rapid toggle
    for (let i = 0; i < 5; i++) mounted.set(i % 2 === 0)
    const spans = root.querySelectorAll("span")
    expect(spans.length).toBeLessThanOrEqual(1)

    // final true mount
    mounted.set(true)
    expect(root.querySelector("span")?.textContent).toBe("X")
    // final false unmount
    mounted.set(false)
    expect(root.querySelector("span")).toBeNull()
  })

  it("applies custom jsxAttributes overrides (as element object property)", () => {
    inflator.jsxAttributes.set("foo" as never, context => context.bind("foo", context.value + "-ok"))
    // @ts-expect-error
    const element = inflator.inflate(<div foo="bar" />)
    expect(element["foo" as never]).toBe("bar-ok" as never)
  })

  it("inflates custom element", () => {
    class CustomDiv extends HTMLDivElement { }
    window.customElements.define("custom-div", CustomDiv)

    // @ts-expect-error
    const inflatedCustomDiv = inflator.inflate(<custom-div />)
    expect(inflatedCustomDiv).toBeInstanceOf(CustomDiv)
  })

  // it("inflates custom element (`is` option)", () => {
  //   class CustomDiv extends HTMLDivElement { }
  //   window.customElements.define("custom-div", CustomDiv)

  //   const inflatedCustomDiv = inflator.inflate(<div is="custom-div" />)
  //   expect(inflatedCustomDiv).toBeInstanceOf(CustomDiv)
  // })
})
