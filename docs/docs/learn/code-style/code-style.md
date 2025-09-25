# Code Style

## Be consistent

It's a good practice in the industry to choose favourite code style and follow it across the codebase,
but it can deviate from project to project.

### Explicit Proton API Usage

If you started using `this.view` Component API, it would be a good tone, to keep using it for this purpose exclusively,
meaning without using Generator syntax (`async function* Component`) or etc.

**Example**: If you started a component like this

```tsx
async function Todo(this: Proton.Component) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

  const todoContext = this.context.require(TodoContext)

  this.view.set(
    <div className="todo">
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
    </div>
  )
}
```

Don't mix with `return` statements

```tsx
async function Todo(this: Proton.Component) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

  const todoContext = this.context.require(TodoContext)

  return ( // Works the same way though.
    <div className="todo">
      <button type="button" on={{ click: props.onRemove }}>x</button>
      <input value={props.content} />
    </div>
  )
}
```
