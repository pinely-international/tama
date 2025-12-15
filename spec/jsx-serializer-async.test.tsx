import "./dom"

import { State } from "@denshya/reactive"
import { beforeAll, describe, expect, it } from "bun:test"

import { injectDOMPolyfill } from "./dom"

import WebJSXSerializerAsync from "../src/jsx/JSXSerializerAsync"
import WebInflator from "@/Inflator/web/WebInflator"


describe("WebJSXSerializerAsync", () => {
  let serializer: WebJSXSerializerAsync

  beforeAll(() => {
    serializer = new WebJSXSerializerAsync
    injectDOMPolyfill(globalThis)
  })

  it("asyncToString null or undefined yields empty string", async () => {
    expect(await serializer.asyncToString(null)).toBe("")
    expect(await serializer.asyncToString(undefined)).toBe("")
  })

  it("asyncToString arrays concatenates elements", async () => {
    expect(await serializer.asyncToString(["a", "b", 3])).toBe("ab3")
  })

  it("asyncToString Element returns outerHTML", async () => {
    const el = document.createElement("div")
    el.innerHTML = "<span>hi</span>"
    expect(await serializer.asyncToString(el)).toBe(el.outerHTML)
  })

  it("asyncToString DocumentFragment concatenates children", async () => {
    const frag = document.createDocumentFragment()
    const t1 = document.createTextNode("X")
    const t2 = document.createTextNode("Y")
    frag.append(t1, t2)
    expect(await serializer.asyncToString(frag)).toBe("XY")
  })

  it("asyncToString Node (Text) returns textContent", async () => {
    const text = document.createTextNode("hello")
    expect(await serializer.asyncToString(text)).toBe("hello")
  })

  it("asyncToString State observable uses get()", async () => {
    const s = new State("foo")
    expect(await serializer.asyncToString(s)).toBe("foo")
    s.set("bar")
    expect(await serializer.asyncToString(s)).toBe("bar")
  })

  it("asyncToString iterable concatenates", async () => {
    const set = new Set(["1", "2", "3"])
    expect(await serializer.asyncToString(set)).toBe("123")
  })

  it("asyncToString JSX intrinsic element", async () => {
    const jsx = { type: "span", props: { children: "hey", className: "c" } }
    expect(await serializer.asyncToString(jsx as any)).toBe("<span class=\"c\">hey</span>")
  })

  it("asyncToString self-closing tag without props", async () => {
    const jsx = { type: "br", props: null }
    expect(await serializer.asyncToString(jsx as any)).toBe("<br/>")
  })

  it("asyncToString object fallback throws", () => {
    expect(async () => await serializer.asyncToString({ foo: "bar" })).toThrow()
  })

  it("apply custom JSX attributes before serialization", async () => {
    const inflator = new WebInflator
    inflator.jsxAttributes.set("foo" as never, context => {
      context.bind("customFoo", `${context.value}-test`)
    })

    serializer.inherit(inflator)
    expect(await serializer.asyncToString(<div foo="bar">ok</div>)).toContain(" customFoo=\"bar-test\"")
  })

  it("asyncComponentToString renders sync component", async () => {
    function Comp(props: { msg: string }) {
      return <p>{props.msg}</p>
    }
    const out = await serializer.asyncComponentToString(Comp, { msg: "hello" })
    expect(out).toBe("<p>hello</p>")
  })

  it("asyncComponentToString renders first view from async components", async () => {
    async function* NullYieldComp() { yield null; yield <div>Should not render</div> }
    async function* YieldComp() { yield <div>Tama <NullYieldComp /></div> }
    function SyncComp() { return <section><YieldComp /></section> }
    async function AsyncComp() { return <p><SyncComp /> 123</p> }
    const out = await serializer.asyncComponentToString(AsyncComp)
    expect(out).toBe("<p><section><div>Tama </div></section> 123</p>")
  })

  it("skips elements with [data-nosnippet]", async () => {
    const element = <div data-nosnippet />
    expect(element).toEqual({ type: "div", props: { "data-nosnippet": true } })
    expect(element.props).toEqual({ "data-nosnippet": true })

    const out = await serializer.asyncToString(element)
    expect(out).toBe("")
  })
})
