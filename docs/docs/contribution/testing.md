---
sidebar_position: 16
---

# Testing

The current Tama repository tests components and rendering behavior with `bun:test` plus `happy-dom`.

The existing spec suite under `spec/` is the best reference for the current style.

## Current Test Stack

- test runner: `bun:test`
- DOM environment: `happy-dom`
- JSX typing checks: `.tsx` files with `@ts-expect-error`
- target imports: a mix of `../build` for public API coverage and `../src/...` for focused unit tests

## DOM Setup

Most DOM-facing tests begin by importing the shared polyfill file.

```ts
import "./dom"
```

In this repository, `spec/dom.ts` installs a `happy-dom` window into `globalThis` and provides a simple `requestAnimationFrame` shim.

## A Typical Rendering Test

```tsx
import "./dom"

import { beforeEach, describe, expect, it } from "bun:test"
import { State } from "@denshya/reactive"
import { WebInflator } from "../build"

describe("Counter view", () => {
  let inflator: WebInflator

  beforeEach(() => {
    inflator = new WebInflator()
    document.body.replaceChildren()
  })

  it("updates text when state changes", () => {
    const count = new State(0)
    const view = inflator.inflate(<button>{count}</button>)

    document.body.append(view)
    expect(document.body.textContent).toBe("0")

    count.set(1)
    expect(document.body.textContent).toBe("1")
  })
})
```

This is the default shape you should prefer for DOM behavior:

- create a fresh inflator per test or per suite
- reset `document.body`
- append the inflated result to the DOM when connection matters
- assert on the visible DOM rather than private internals

## Event Tests

Event tests are straightforward because Tama binds real DOM listeners.

```tsx
import "./dom"

import { describe, expect, it } from "bun:test"
import { WebInflator } from "../build"

describe("button events", () => {
  it("invokes click handler", () => {
    const inflator = new WebInflator()
    let clicked = false

    const button = inflator.inflate(
      <button on={{ click: () => { clicked = true } }}>Save</button>
    ) as HTMLButtonElement

    button.click()
    expect(clicked).toBe(true)
  })
})
```

## Async Component Tests

When testing async components or async generators, wait for the DOM environment to flush async work.

```tsx
import "./dom"

import { describe, expect, it } from "bun:test"
import { WebInflator } from "../build"

describe("async components", () => {
  it("renders the resolved view", async () => {
    const inflator = new WebInflator()

    async function AsyncCard() {
      return <p>Loaded</p>
    }

    const view = inflator.inflate(<AsyncCard />)
    document.body.append(view)

    await window.happyDOM.whenAsyncComplete()
    expect(document.body.textContent).toContain("Loaded")
  })
})
```

Use `window.happyDOM.whenAsyncComplete()` when the test depends on pending promise work finishing inside the virtual DOM environment.

## Mount And Lifecycle Tests

If you test `mounted`, `MountObserver`, or anything that depends on connection state, the element must actually be attached to the document.

```tsx
const view = inflator.inflate(<span mounted={visible}>Visible</span>)
document.body.append(view)
```

Without attachment, connection-sensitive behavior is easy to misread.

## Type Tests

The repository already uses `.tsx` test files for JSX typing coverage.

```tsx
import { describe, it } from "bun:test"

function expectType<T>(value: T): void {}

describe("JSX types", () => {
  it("rejects invalid props", () => {
    // @ts-expect-error
    const element = <div unknownProp={123} />
    expectType<JSX.Element>(element)
  })
})
```

This is useful for:

- intrinsic attribute coverage
- component prop contracts
- `ref` typing
- custom JSX attribute augmentation

## What To Import

Choose the import target based on what you are trying to protect.

### Import from `../build`

Use this when the test should reflect the consumer-facing package surface.

### Import from `../src/...`

Use this for narrow unit tests against internal helpers or implementation details.

The current repo uses both patterns.

## Running Tests

The repository keeps tests in `spec/` and uses Bun.

Typical commands are:

```bash
bun test spec
```

or from inside the `spec/` directory:

```bash
bun test
```

If a test imports from `../build`, make sure the package has already been built.

## Good Tama Test Habits

- test DOM output and reactive updates, not just raw returned objects
- prefer small component fixtures instead of mocking the entire inflator
- keep async expectations explicit with `whenAsyncComplete()` when needed
- reset document state between tests
- add type tests whenever you add or change JSX surface area