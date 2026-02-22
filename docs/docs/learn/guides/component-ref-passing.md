# Component `Ref` passing

To pass a reference through a component props - you simply do it.

```tsx
import { Ref } from "@denshya/tama"

function Child(props: { ref: Ref<HTMLElement> }) {
  return <div><section ref={props.ref} /></div>
}

function Test() {
  const ref = new Ref<HTMLElement>
  return <Child ref={ref}>
}
```

You can also pass a local ref since `ref` attribute on elements can accept multiple ones.

```tsx
import { Ref } from "@denshya/tama"

function Child(props: { ref: Ref<HTMLElement> }) {
  const localRef = new Ref<HTMLElement>
  return <div><section ref={[props.ref, localRef]} /></div>
}
```
