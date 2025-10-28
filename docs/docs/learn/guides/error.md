# Error catching

Just like React, Tama provides an interface to catch errors thrown in children components.

```tsx
function Child() { throw new Error("Test") }

function Parent(this: Tama.Component) {
  this.catch(thrown => { /* Do something */ })

  return <div><Child /></div>
}
```

The parent can catch its own errors that happens after `catch` declaration.

```tsx
function Parent(this: Tama.Component) {
  this.catch(thrown => { /* Do something */ })

  throw new Error("parent error")
}
```

Event handlers are also caught, though they don't break the component view if they error.

```tsx
function Child(this: Tama.Component) {
  // This will catch a event handler error.
  this.catch(thrown => { /* Do something */ })

  return <button on={{ click: () => { throw new Error("Test") } }} />
}
```
