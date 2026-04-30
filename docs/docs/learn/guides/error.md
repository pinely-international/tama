# Error Handling

Tama's philosophy around errors is to isolate failures and provide a channel for observing them.

## Low-Level Tree Error Channel

If you need to observe errors thrown on the current component tree, subscribe through `this.tree.catch(...)`.

```tsx
function Child(this: Tama.Component) {
  this.tree.catch(thrown => {
    console.error("component tree error", thrown)

    // Optionally set a fallback view via `this.view.set(...)`.
  })

  throw new Error("Child error")
}

function Parent() {
  this.tree.catch(thrown => {
    // Track errors at the parent level for monitoring or analytics.
  })

  return (
    <div>
      <Child />
      <span>Sibling content survives child component failure</span>
    </div>
  )
}
```

---

Continue with [Async Views](./async-views.md) and [Changing Views](./changing-views.md) for the currently documented fallback pattern.
