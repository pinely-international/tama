# Proton

It is light weight (~5kb gzip) library for parsing JSX in SolidJs way, but based on Observables rather than Signals and it's extremely customizable and open.

This documentation built to be read from top to bottom in one go, gradually introducing you the library and its abilities and eventually you should understand 100% of Proton.

_I know "Proton" is already used for many things, but I wasn't able to come up with a more unique name :(_

## Motivation

Other libraries provide their own built-in “primitives” that you **must** to stick to.
They restrict extensibility in a favor of concealing implementation details.

## Pillars

- [No Framework](https://dev.to/framemuse/no-framework-principle-arised-2n39)
- Open Internals
- Fault Tolerance
- Customization

## Install

```bash
bun i @denshya/proton
```

For the JSX and types to work properly, you should add this to your `tsconfig.json`/`jsconfig.json`

```json
{
  "compilerOptions": {
    // ...
    "types": [
      // ...
      "@denshya/proton/globals"
      ],
    "jsx": "react-jsx",
    "jsxImportSource": "@denshya/proton",
    // ...
  }
}
```

**`vite`**
If you're using `vite`, that's all configuration you need.

**Other bundlers**
For other bundlers you will need to tell them that you want to use `@denshya/proton` as your JSX provider.

## Getting Started

```tsx
function App() {
  return <div>Hello World!</div>
}

const inflator = new WebInflator
const AppView = inflator.inflate(<App />)

document.getElementById("root").replaceChildren(AppView)
```

## JSX

Proton supports React-like JSX, except that it maps directly to [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) elements and allows any value to be put into attributes or as children of **any elements**.

```xml
<div className="product-card">
  <h2>Title</h2>
  <p>Description</p>
  <img src="/static/product-card.jpg" />

  // You can put your weird staff.
  <aside id={new MyIdObject} />
</div>
```

Learn more about [Inflator](#inflator) to provide custom handlers.

## Components

To create a component, (currently) you need to create a function.
It doesn't have any constraints on what can be returned.

```tsx
const EmptyComponent = () => {} // Works.
function MyApp() { return <div></div> } // Works.
```

Props are passed the familiar way.

```tsx
const EmptyComponent = (props) => {} // Works.
function MyApp(props) { return <div></div> } // Works.
```

Though there is a little difference: you can define initial props value.
It will work in runtime, but (currently) you will have an error in TypeScript.

```tsx
class MyAppProps {}

function MyApp(props = new MyAppProps) {
  return <div></div>
}
```

## Special Attributes (Events, Styles, Namespaces)

Proton defines several "special" attributes for [Intrinsic Elements](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements) for convenience's sake.

```tsx
function MyApp() {
  return (
    <div
      style={{ display: "absolute" }}
      on={{ click: event => event.pointerId }}
    >
      // This element will be `SVGAElement` instead of `HTMLAnchorElement`
      <a ns="http://www.w3.org/2000/svg" />
    </div>
  )
}
```

`style` is special because it's extended to consume an Record object with various property types, including Observables.

## States (Observables)

[What are Observables?](https://github.com/tc39/proposal-observable)

Proton adopts observable as another primitive. Any object that has `Symbol.subscribe` considered to be an observable.

Beyond that, it treats any object that has either `get` or `set` to be an accessor. Which can be combined with observable, getting an **Observable Accessor**.

> It might seem to be a problematic decision considering `Map` and `Set` built-ins, but this is a start to solving it and in practice it's almost never a problem.

---

There is no built-in state manager, Proton only handles Observables as is. Now creating data flows is your problem :) Joking, it always was, now it's separated from the "framework", so you can use any library that supports Observables. Like the one that is created specially for Proton - [Flow](https://github.com/denshya/flow).

```tsx
const regularText = "Static Value"
const observableText = {
  i: 0,
  get: () => "Initial",
  [Symbol.subscribe](next) {
    setInterval(() => next("Next: " + this.i++))
  }
}

function MyApp() {
  return (
    <div>{regularText} {observableText}</div>
  )
}
```

This may seem like a lot, but in reality it all will be hidden behind objects.

To implement a state, all you need is this simple snippet.

```ts
class State<T> {
  private readonly callbacks = new Set<(value: T) => void>()
  private value: T

  constructor(initialValue: T) { this.value = initialValue }

  get(): T { return this.value }
  set(value: T): void {
    this.value = value
    this.dispatch(value)
  }

  private dispatch(value: T) {
    this.callbacks.forEach(callback => callback(value))
  }

  [Symbol.subscribe](next: (value: T) => void) {
    this.callbacks.add(next)
    return { unsubscribe: () => void this.callbacks.delete(next) }
  }
}
```

In practice it looks like this

```tsx
function ProductCard() {
  const title = new State("Title")
  const image = new State("Image source")

  return (
    <>
      <div className="product-card__title">{title}</div>
      <img className="product-card__image" src={image} alt="Preview" />

      <input value={title} />
      <input value={image} />
    </>
  )
}
```

To get started faster with this, try [`Flow`](https://github.com/denshya/flow) state library.

### Dual binding

Some elements may have binding in **two directions**, which means that [state **updates** element] and [element **updates** state].

This is common for user input elements just like `input` and `textarea`.

If you're using [`Flow`](https://github.com/denshya/flow) library, you can avoid this behavior with `readonly` method.

```tsx
function ProductCard() {
  const title = new Flow("Title")

  return (
    <>
      // User inputs won't update the `title`.
      <input value={title.readonly()} />
      // User inputs WILL update the `title`.
      <input value={title} />
    </>
  )
}

```

## Lists (Iterables)

Another built support is for `Iterable`, any object that has `Symbol.iterator` will be treated as an iterable, which will be iterated to inflate (render/create).

If it is an Observable Iterable, it will follow changes by iterating again and replacing all previous elements with **no reconciliation**.

To force reconciling, use built-in helper [`Proton.Reconcile`](#reconcile).
Learn more about [reconciling](https://dev.to/framemuse/list-reconciling-problem-3gj1).

## Conditional Rendering (Mounting)

### Attribute `mounted`

Each element and component has `mounted` attribute, which is defined by a Boolean Observable Getter. The inflated element is preserved between mounting and dismounting, it is never reevaluated.

- If `true`, the element is connected (appended) to the document
- If `false`, the element is disconnected (removed) from the document

#### Example

```jsx
const mounted = State(false)
setTimeout(() => mounted.set(true))

<span mounted={mounted}>
```

### Guards

#### Pattern

[Guard pattern](https://en.wikipedia.org/wiki/Guard_(computer_science)) usually refers to a Return/Throw Guard in JavaScript.

However, in Proton it is a predicate, which defines if an object is ok to use. If the `valid` guard return `false`, normally it is simply skipped.

```tsx
const plain = { value: 1 }
const guarded = { value: 1, valid(value) { return value > 0 } }
```

This very mechanism is used to tell if an element should be mounted or unmounted by invoking `valid` function.

In case of Observable Guarded object, it will call the guard on each update.

### JSX Attribute Guarding

Each JSX attribute can be a **Mounting Guard**, which means the element is mounted only when every attribute is **NOT** guarded.

TypeScript: This approach allows type narrowing, so your property is always getting a correct type.

If you're using [`Flow`](https://github.com/denshya/flow), you can use `guard` method or built-in predicates like `required`.

```tsx
const className = new Flow("")
const content = new Flow<string | null>(null)

const Component = () => (
  <>
    <span className={className.guard(it => !it)}>{content.required}</span>
  </>
)
```

As you can see even the children can be guarded. The `guard` method can be implement by your State library or you can create your own utility function do that to cover your special cases.

---

If you dislike this method, you can implement the way SolidJS does it or your unique way by [Extending Default Behavior](#inflator-extension).

### Real-World Example

A component example I converted from React and changed a bit for demonstration purposes.

```tsx
import { Flow, Flowable } from "@denshya/flow"


interface MiniProfileProps {
  user: Flowable<User>
}

function MiniProfile(props: MiniProfileProps) {
  const user = Flow.from(props.user)

  const inputValue = new Flow("")
  const inputMounted = new Flow(false)

  inputValue.sets(user.$.avatar)

  return (
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <button className="mini-profile__letter" mounted={user.$.avatar.isNullish}>
         <ColoredLetter letter={user.$.firstName.$[0]} />
        </button>
        <img className="mini-profile__avatar" src={user.$.avatar.required} alt="avatar" />
        <input value={inputValue} mounted={inputMounted} />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{user.$.firstName} {user.$.lastName.$[0]}.</div>
          <div className="mini-profile__email">{user.$.email}</div>
        </div>
      </div>
      <button type="button" on={{ click: () => inputMounted.set(it => !it) }}>
        <Icon name="pen" />
      </button>
    </div>
  )
}
```

## Shell

The components are not actually components, they are constructors and evaluators for `Proton.Shell`, this is a heart of every component.

However, it doesn't mean component **creates** a `Proton.Shell`, actually it is created **before** constructor is invoked, but when it's done the shell is passed as `this` argument.

Which opens controls to the APIs of component behavior.

## View API

This controls which element is displayed under a component.

```tsx
function MyView(this: Proton.Shell) {
  this.view.set(<div>Hello World!</div>)

  setTimeout(() => {
    this.view.set(<div>I'mg Replaced!</div>)
  }, 1000)
}
```

That's why a component can return nothing - it may set a view via `this.view.set`.

Return defines a `default` view for a component under `this.view.default` property.

### Caching Elements

Optionally, you can optimize your elements by inflating them beforehand.

```tsx
function MyView(this: Proton.Shell) {
  const helloWorldView = this.inflator.inflate(<div>Hello World!</div>)
  const replacedView = this.inflator.inflate(<div>I'm Replaced!</div>)

  this.view.set(helloWorldView)
  setTimeout(() => this.view.set(replacedView), 1_000)
}
```

Or use [`Proton.Switch`](#switch) helper.

## Async/Await

Every component can by an async function. That's where `ViewAPI` comes in handy.

First we set a loader placeholder to be displayed, then when the promise is resolved the default view will be set.

```tsx
async function MyView(this: Proton.Shell) {
  this.view.set(<Loader />)

  await new Promise(resolve => setTimeout(resolve, 1_000))

  return <div>I'm loaded!</div>
}
```

## Suspense Boundaries

> But what if want to **throw** a `Promise` not await it?

Well... Why not.

```tsx
function MyView(this: Proton.Shell) {
  this.view.set(<Loader />)

  throw new Promise(resolve => setTimeout(resolve, 1_000))

  return <div>I'm loaded!</div>
}
```

Make sure your component OR parent does something like that

```tsx
function Parent(this: Proton.Shell) {
  this.suspense(() => this.view.set(<Loader />))
  this.unsuspense(() => this.view.set(this.view.default))

  return <div><MyView /></div>
}
```

## Error Boundaries

Just like React, Proton provides an interface to catch errors thrown in children components.

```tsx
function Child() { throw new Error("Test") }

function Parent(this: Proton.Shell) {
  this.catch(thrown => { /* Do something */ })

  return <div><Child /></div>
}
```

But the difference is event handlers. They are caught as well.

```tsx
function Child(this: Proton.Shell) {
  // This will catch a event handler error.
  this.catch(thrown => { /* Do something */ })

  return <button on={{ click: () => { throw new Error("Test") } }} />
}
```

## Context API

IMHO, the most satisfying API in Proton. Basically, this API is a `Map` that use class constructor as key and its instance as value.

This means you create your contexts by creating classes.

```tsx
class MyContext { constructor(readonly value: string) {} }

function Child(this: Proton.Shell) {
  const context = this.context.require(MyContext)

  return <span>{context.value}</span>
}

function Parent(this: Proton.Shell) {
  this.context.provide(new MyContext("Cool"))

  return <div><Child /></div>
}
```

## Inflator

A class that is responsible for creating a view representation held in memory.

### JSX Custom Attributes

This extends JSX attributes. It requires three steps to make it work.

1. Declare custom attribute with `customAttributes.set`.
2. Bind attribute(s) to the element, this may override intrinsic attributes.
3. Augment `JSX.CustomAttributes` interface to include the custom attribute if you're using TypeScript.

#### Real-world Example

```ts
import { WebInflator } from "@denshya/proton"
import { castArray } from "./utils/common"
import { bemFlow } from "./utils/bem"
import { Flowable } from "@denshya/flow"

declare global {
  namespace JSX {
    interface CustomAttributes {
      /** Applies modifiers based `className` and overrides `className` attribute. */
      classMods?: { [K in keyof never]: Flowable<unknown> } | Flowable<unknown>[]
    }
  }
}

function applyCustomAttributes(inflator: WebInflator) {
  inflator.customAttributes.set("classMods", context => {
    if (context.value == null) return

    context.bind("className", bem(context.props.className as never, ...castArray(context.value)))
  })
}

export default applyCustomAttributes

```

### Inflator Adapters

This is a "strong" customization since it allows you to override the end output of `inflate` method.

#### Abstract example

You can provide inflate instructions to your own structures, lately they can be inserted as part of JSX.

```tsx
class PriceWebInflator {
  constructor(inflator: Inflator) {}

  inflate(price: unknown) {
    if (price instanceof Price === false) return

    const span = document.createElement("span")
    span.textContent = price.value + price.sign

    return span
  }
}

const inflator = new WebInflator
inflator.adapters.add(PriceWebInflator)

function MyApp() {
  return <div>{new Price(123, "USD")}</div>
}

const MyAppInflated = inflator.inflate(<MyApp />)
document.getElementById("root").replaceChildren(MyAppInflated)
```

### Inflator Extension

`WebInflator` is a class, it has some `public` methods, but it also has several `protected` methods, which might be interesting for you.

## Built-in Helpers

### `Reconcile`

Currently not implemented, but this is a desired syntax

```tsx
const array = Observable([{a:1}, {a:2}, {a:3}])
array.set([{a:0}, {a:2}, {a:4}]) // Will trigger list reconciling, which will create 2 new elements, but will **reuse** the one with unchanged key (`{a:2}`).

const list = new Proton.Reconcile(array, { key: it => it.a })
list.key = it => it.b // Assigns a new `key` selector.

<div>{list.map((observableValue, index) => <span>{observableValue} {index}</span>)}</div>
```

### `Dynamic`

Instead of creating one component and observables to be handled internally, thus making it "Static".
You can make it "Dynamic" by swapping components/elements based on observables passed as `props`.

This is extremely useful if you have nested observables.

```tsx
<span>{Proton.Dynamic(Component, { id: observableId })}</span>
```

### `Switch`

It can be used both for Component View swapping and as a part of any JSX element.
In case of being part of JSX, you should connect `ProtonSwitchWebInflator`.

```tsx
const inflator = new WebInflator
inflator.adapters.add(ProtonSwitchWebInflator)

function SwitchComponent(this: Proton.Shell) {
  const switcher = new ProtonSwitch({
    banned: <span>Banned</span>,
    pending: <span>Pending</span>,
    default: <span>Loading...</span>
  })

  switcher.set("banned") // View will change to <span>Banned</span>.
  switcher.set("pending") // View will change to <span>Pending</span>.
  switcher.set("default") // View will change to <span>Loading...</span>.

  switcher.sets(this.view)
  return switcher.current.value
}

async function UserProfile() {
  const userStatusSwitch = new Proton.Switch({
    banned: <Status color="red">Banned</Status>,
    pending: <Status color="yellow">Pending</Status>,
    default: <Status color="green">Active</Status>
  })

  const user = await requestCurrentUser()
  user.status.sets(userStatusSwitch)

  return (
    <div>
      ...
      <div>Status: {userStatusSwitch}</div>
      ...
    </div>
  )
}
```

### `Lazy`

It can be used for dynamic imports, but it is strongly recommended to implement this one in your own way as it's very simple and will give your users a much better UX.

```tsx
function Lazy(importFactory: () => Promise<unknown>) {
  return async function (this: Proton.Shell) {
    this.view.set(<Loader />)
    const Module = await importFactory()
    return <Module />
  }
}

const UserProfile = Lazy(async () => (await import("pages/user-profile")).default)
<UserProfile />

```

## TypeScript

Report if there are any uncovered TypeScript related issues.
