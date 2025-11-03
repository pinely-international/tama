# Code Style

## Be consistent

It's a good practice in the industry to choose favourite code style and follow it across the codebase,
but it can deviate from project to project.

### Tama APIs mixing

If you started using `this.view` Component API, it would be a good tone, to avoid mixing alternatives for this API,
e.g. using Generator syntax (`async function* Component`) together with `this.view.set`.

**Example**: If you started a component like this

```tsx
async function Todo(this: Tama.Component) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

  const todoContext = this.tree.context.require(TodoContext)

  this.view.set(
    <div className="todo">
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
    </div>
  )
}
```

Don't mix with `return` or `yield` statements

```tsx
async function Todo(this: Tama.Component) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

  const todoContext = this.tree.context.require(TodoContext)

  return ( // Works the same way though.
    <div className="todo">
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
    </div>
  )
}
```

However, you can still use other APIs like **context** in this example.
