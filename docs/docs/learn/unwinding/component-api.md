# Component API

The components are not actually components, they are constructors and evaluators for `Tama.Component`, this is a heart of every component.

However, it doesn't mean component **creates** a `Tama.Component`, actually it is created **before** constructor is invoked, but when it's done the component instance is passed as `this` argument.

Which opens controls to the APIs of component behavior.

## Factory

Each component needs a factory, for that you need to create a function.
It doesn't have any constraints on what can be returned.

```tsx
const EmptyComponent = () => {} // Works.
function MyApp() { return <div></div> } // Works.
```

Props are passed as the first argument, *no other arguments are not passed*.

```tsx
const EmptyComponent = (props) => {} // Works.
function MyApp(props) { return <div></div> } // Works.
```

Initial props value can be defined.
It will work in runtime, but *currently* you will have an error in TypeScript.

```tsx
class MyAppProps {}

function MyApp(props = new MyAppProps) {
  return <div></div>
}
```

Creation of `Tama.Component` is skipped for arrow functions (it can't access `this`), but not for async arrow functions (swapping views is controlled by `Tama.Component`, then it's garbage collected).

```tsx
const MyApp = () => <div></div> // Component API can't be accessed.
```

## `Tama.Component` as "Class Component"

Currently there is no such concept as Class Component, you can't use `Tama.Component` as a component.
*But if you have an interest in having it, please, create/support discussions on github.*
