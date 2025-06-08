# Top Level

There are no limits on what can be defined or used in the top level (of a file).

```tsx title="MyView.jsx"
import { State } from "@denshya/reactive"
```

```tsx
const text = new State("Global Text")

const helloWorldView = <div>Hello World! {text}</div>
const replacedView = <div>I'm Replaced! {text}</div>
// ^ These won't be inflated immediately, this just creates JSX objects,
// which can be perceived as element references.
```

You can define states, JSX or even inflate it at top level.

```tsx title="MyView.jsx"
import { inflator } from "./inflator"

const inflatedHelloWorld = inflator.inflate(helloWorldView)
```

```tsx
function MyView() {
  this.view.set(helloWorldView)

  requestAnimationFrame(() => {
    const number = Math.floor(Math.random() * 100)
    text.set(`Global Text: ${number}`)
  })

  setTimeout(() => this.view.set(inflatedHelloWorld), 1_000)
  setTimeout(() => this.view.set(replacedView), 1_000)
  setTimeout(() => this.view.set(<div>{text} everywhere</div>), 1_000)
  setTimeout(() => this.view.set(<ChildView />), 1_000)
}

function ChildView() {
  return <div>{text} everywhere</div>
}

export default MyView
```
