import "./dom"

import { describe, expect, it, beforeEach } from "bun:test"

import Proton from "../src/Proton/Proton"
import WebInflator from "../src/Inflator/web/WebInflator"

describe("Proton.Ref and JSX ref", () => {
  let inflator: WebInflator

  beforeEach(() => {
    inflator = new WebInflator()
    document.body.replaceChildren()
  })

  it("Proton.Ref.resolve assigns to Proton.Ref.current", () => {
    const ref = new Proton.Ref<HTMLElement>(null)
    const element = document.createElement("div")

    Proton.Ref.resolve(ref, element)

    expect(ref.current).toBe(element)
  })

  it("Proton.Ref.resolve calls callback refs", () => {
    let called: Element | null = null
    const callback = (element: Element) => { called = element }
    const element = document.createElement("span")

    Proton.Ref.resolve(callback, element)

    expect(called).toBe(element)
  })

  it("Proton.Ref.resolve handles arrays of refs", () => {
    const ref1 = new Proton.Ref<HTMLParagraphElement>(null)
    const ref2: { current: HTMLParagraphElement | null } = { current: null }

    let called: HTMLParagraphElement | null = null
    const callback = (element: HTMLParagraphElement) => { called = element }

    const element = document.createElement("p")

    Proton.Ref.resolve([ref1, ref2, callback], element)

    expect(ref1.current).toBe(element)
    expect(ref2.current).toBe(element)
    expect(called).toBe(element)
  })

  it("inflating <div ref={...} /> assigns the element to the ref", () => {
    const ref = new Proton.Ref<HTMLDivElement | null>(null)
    ref.current

    const element = inflator.inflate(<div ref={ref} />) as HTMLDivElement

    expect(element).toBeInstanceOf(HTMLElement)
    expect(ref.current).toBe(element)
  })
})
