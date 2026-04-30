# Suspense

Initially, Suspense was planned to be a built-in feature of Tama, but it was removed since it was tightly coupled to the core and couldn't be extended at all.

In replacement, a new approach was taken, which is to support required APIs to build Suspense-like patterns in userland, without any special support from the core.

## Tree Error Catching

To support Suspense-like patterns, Tama provides a way to catch errors thrown from any descendant component in the tree, which can be Promises just like in React Suspense.

Something like this can be implemented in userland:

```tsx
function Suspense(this: Tama.Component, props: { children: unknown, fallback: unknown }) {
  const loading = new State(false)
  loading.subscribe(x => {
    if (x) {
      this.view.set(props.fallback)
    } else {
      this.view.set(props.children)
    }
  })

  this.tree.catch(error => {
    if (error instanceof Promise === false) return

    loading.set(true)
    error.then(() => loading.set(false))
  })

  return props.children
}
```

## Async Views

Use async components, async generators and explicit loading views.
Read more in [Async Views](./async-views.md).
