# Suspense

```tsx
function MyView(this: Tama.Component) {
  this.view.set(<Loader />)

  throw new Promise(resolve => setTimeout(resolve, 1_000))

  return <div>I'm loaded!</div>
}
```

Make sure a parent catches it by using `suspense` and `unsuspense`. This is an experimental API, so don't rely on it too much.

```tsx
function Parent(this: Tama.Component) {
  this.suspense(() => this.view.set(<Loader />))
  this.unsuspense(() => this.view.set(this.view.default))

  return <div><MyView /></div>
}
```
