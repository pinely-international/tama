// import { State } from "@denshya/reactive"
// import { describe, expect, it } from "bun:test"

// import { Proton, WebInflator } from "../build"

// describe("Tama.Switch", () => {
//   const inflator = new WebInflator()

//   const make = (source?: State<unknown>) => new Tama.Switch(inflator, () => null, source)

//   it("initializes a component", () => {
//     const sw = make()
//     expect(sw.component).toBeInstanceOf(ProtonComponent)
//   })

//   it("updates the view when State changes", () => {
//     const src = new State<number>(0)
//     const sw = make(src)
//     sw.component.factory = val => `view:${val}`

//     src.set(1)
//     expect(sw.get()).toBe("view:1")

//     src.set(2)
//     expect(sw.get()).toBe("view:2")
//   })

//   it("keeps view consistent when State does not change", () => {
//     const src = new State<string>()
//     const sw = make(src)
//     sw.component.factory = val => `v:${val}`

//     src.set("X")
//     const result1 = sw.get()
//     src.set("X")
//     const result2 = sw.get()

//     expect(result1).toBe("v:X")
//     expect(result2).toBe("v:X")
//   })

//   it("forwards lifecycle events to component", () => {
//     const sw = make()
//     let mounted = false
//     sw.on("mount").subscribe(() => { mounted = true })
//     sw.component.events.dispatch("mount")
//     expect(mounted).toBe(true)
//   })

//   it("applies parent context via from()", () => {
//     const parent = new ProtonComponent(inflator)
//     const sw = make()
//     sw.from(parent)
//     expect(sw.component.context.parent).toBe(parent.context)
//   })

//   it("supports use() hooks", () => {
//     const sw = make()
//     let ran = false
//     sw.use(() => { ran = true })
//     sw.component.events.dispatch("mount")
//     expect(ran).toBe(true)
//   })

//   it("cleans up on destroy()", () => {
//     const sw = make()
//     let cleaned = false
//     sw.component.use(() => () => { cleaned = true })
//     sw.destroy()
//     expect(cleaned).toBe(true)
//   })

//   it("sets props via set()", () => {
//     const sw = make()
//     sw.set({ x: 42 })
//     expect(sw.component.props.x).toBe(42)
//   })

//   it("uses the current view if State not given", () => {
//     const sw = make()
//     sw.component.factory = () => "default"
//     expect(sw.get()).toBe("default")
//   })
// })
