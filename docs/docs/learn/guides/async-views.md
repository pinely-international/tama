# Async Views

Rendering async views can be done with [View API] or with async component.

```tsx
function MyView(this: Tama.Component) {
  await new Promise(resolve => setTimeout(resolve, 1_000))

  this.view.set(<div>I'm loaded!</div>)
}
```

But this leads to uncommon behavior when a view appears from out of nowhere since there is no initial view.
To solve this, set a loader placeholder to be displayed initially, then when the promise is resolved the default view will be set.

```tsx
async function MyView(this: Tama.Component) {
  this.view.set(<Loader />)

  await new Promise(resolve => setTimeout(resolve, 1_000))

  return <div>I'm loaded!</div>
}
```

Alternatively, you can use Async Generator Function to avoid usage of `this`

```tsx
async function* MyView() {
  yield <Loader />

  await new Promise(resolve => setTimeout(resolve, 1_000))

  return <div>I'm loaded!</div>
}
```
