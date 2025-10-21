# Tree Context API

This API is a `Map` that uses class constructor as key and its instance as value.

This means you create your contexts by creating classes.

```tsx
class MyContext { constructor(readonly value: string) {} }
```

The child must define the context it requires

```tsx
function Child(this: Tama.Component) {
  const context = this.context.require(MyContext)

  return <span>{context.value}</span>
}
```

The parent provides the context at will

```tsx
function Parent(this: Tama.Component) {
  this.context.provide(new MyContext("Cool"))

  return <div><Child /></div>
}
```

If children require contexts but no parent is providing one, they will error.

```tsx
function Child(this: Tama.Component) {
  const context = this.context.require(MyContext) // Error: No context provided.

  return <span>{context.value}</span>
}
```

:::info
Learn what happens when component faces error at [Fault Tolerance](../unwinding/fault-tolerance.md)
:::

:::info
Learn how to react to component errors at [Error catching](./error.md)
:::
