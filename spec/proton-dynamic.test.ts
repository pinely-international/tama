// // tests/proton-dynamic.test.ts
// import { State } from "@denshya/reactive"
// import { describe, expect, it } from "bun:test"

// import { Proton, WebInflator } from "../build"

// describe("ProtonDynamic", () => {
//   const inflator = new WebInflator()

//   const make = (source?: State<unknown>) => Proton.Dynamic(inflator, () => null, source)

//   // it("initializes with a component and optional State", () => {
//   //   const dyn = make()
//   //   expect(dyn.component).toBeInstanceOf(ProtonComponent)
//   // })

//   it("resets and evaluates when State emits new value", () => {
//     const src = new State<number>(0)
//     const dyn = make(src)

//     let evalCount = 0
//     dyn.component.factory = () => {
//       evalCount++
//       return { v: evalCount }
//     }

//     const results: any[] = []
//     dyn.component.on("view").subscribe(v => results.push(v))

//     src.set(1)
//     src.set(2)
//     src.set(2)
//     src.set(3)

//     expect(results.map(r => r.v)).toEqual([1, 2, 3])
//   })

//   it("forwards events to inner component", () => {
//     const dyn = make()
//     let mounted = false
//     dyn.on("mount").subscribe(() => { mounted = true })
//     dyn.component.events.dispatch("mount")
//     expect(mounted).toBe(true)
//   })

//   it("applies parent context via from", () => {
//     const parent = new ProtonComponent(inflator)
//     const dyn = make()
//     dyn.from(parent)
//     expect(dyn.component.context.parent).toBe(parent.context)
//   })

//   it("updates props on set", () => {
//     const dyn = make()
//     dyn.set({ foo: 123 })
//     expect(dyn.component.props.foo).toBe(123)
//   })

//   it("uses current view when source State not provided", () => {
//     const dyn = make()
//     dyn.component.factory = () => "hello"
//     const result = dyn.get()
//     expect(result).toBe("hello")
//   })

//   it("uses latest view from State when present", () => {
//     const src = new State<string>()
//     const dyn = make(src)
//     src.set("X")
//     expect(dyn.get()).toBe("X")
//   })

//   it("delegates .use() to component", () => {
//     const dyn = make()
//     let ran = false
//     dyn.use(() => { ran = true })
//     dyn.component.events.dispatch("mount")
//     expect(ran).toBe(true)
//   })

//   it("calls .destroy() on component", () => {
//     const dyn = make()
//     let cleaned = false
//     dyn.component.use(() => () => { cleaned = true })
//     dyn.destroy()
//     expect(cleaned).toBe(true)
//   })
// })
