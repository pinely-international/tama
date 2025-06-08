# Component API

The components are not actually components, they are constructors and evaluators for `Proton.Component`, this is a heart of every component.

However, it doesn't mean component **creates** a `Proton.Component`, actually it is created **before** constructor is invoked, but when it's done the component instance is passed as `this` argument.

Which opens controls to the APIs of component behavior.

## Factory

Each component needs a factory, for that you need to create a function.
It doesn't have any constraints on what can be returned.

```tsx
const EmptyComponent = () => {} // Works.
function MyApp() { return <div></div> } // Works.
```

Props are passed the   way.

```tsx
const EmptyComponent = (props) => {} // Works.
function MyApp(props) { return <div></div> } // Works.
```

Though there is a little difference: you can define initial props value.
It will work in runtime, but (currently) you will have an error in TypeScript.

```tsx
class MyAppProps {}

function MyApp(props = new MyAppProps) {
  return <div></div>
}
```

## `Proton.Component`

Currently there is no such concept as
