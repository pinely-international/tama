# Portal

Portals in TamaJs are natural and straightforward,
usually you need them if you want to access a component props or context
while putting an element to non-JSX environment, an arbitrary place of document.

To do that, you need to access component scoped `inflator` instance

```tsx
function Component(this: Tama.Component) {
  const context = this.context.require(MyContext)
  const element = this.inflator.inflate(<OtherComponent data={context.data} />)

  document.body.append(element)
}
```
