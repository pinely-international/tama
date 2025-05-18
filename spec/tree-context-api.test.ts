// tests/tree-context-api.test.ts
import { beforeEach, describe, expect, it } from "bun:test"

import TreeContextAPI from "../src/TreeContextAPI"

describe("TreeContextAPI", () => {
  let api: TreeContextAPI

  beforeEach(() => {
    api = new TreeContextAPI
  })

  it("provides and requires a context value", () => {
    class Theme { constructor(public name: string) { } }
    const theme = new Theme("dark")
    api.provide(theme)

    const consumed = api.require(Theme)
    expect(consumed).toBe(theme)
  })

  it("throws when requiring unprovided context", () => {
    class Missing { }
    expect(() => api.require(Missing)).toThrow(Error)
  })

  // it("supports hierarchical providers", () => {
  //   class User { constructor(public id: number) { } }
  //   const rootUser = new User(1)
  //   api.provide(rootUser)

  //   // create child API scoped on nested element

  //   const childApi = new TreeContextAPI(childEl)

  //   const childUser = childApi.require(User)
  //   expect(childUser).toBe(rootUser)

  //   // override in child
  //   const overrideUser = new User(2)
  //   childApi.provide(User, overrideUser)
  //   expect(childApi.require(User)).toBe(overrideUser)

  //   // parent remains unchanged
  //   expect(api.require(User)).toBe(rootUser)
  // })

  // it("removes context when disposed", () => {
  //   class Ctx { constructor(public v: number) { } }
  //   const ctx = new Ctx(5)
  //   api.provide(Ctx, ctx)
  //   api.dispose(Ctx)
  //   expect(() => api.require(Ctx)).toThrow()
  // })

  it("allows multiple different contexts", () => {
    class A { constructor(public a: string) { } }
    class B { constructor(public b: boolean) { } }
    const a = new A("x"), b = new B(true)
    api.provide(a)
    api.provide(b)

    expect(api.require(A)).toBe(a)
    expect(api.require(B)).toBe(b)
  })

  // it("does not bleed contexts between sibling branches", () => {
  //   class S { constructor(public v: string) { } }
  //   const root = new S("root")
  //   api.provide(root)

  //   const child1 = dom.createElement("div")
  //   const child2 = dom.createElement("div")
  //   dom.getElementById("root")!.append(child1, child2)

  //   const api1 = new TreeContextAPI(child1)
  //   const api2 = new TreeContextAPI(child2)

  //   const override = new S("override")
  //   api1.provide(S, override)

  //   expect(api1.require(S).v).toBe("override")
  //   expect(api2.require(S).v).toBe("root")
  // })
})
