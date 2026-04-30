# React to Tama

Tama can build the same kinds of applications you would normally build with React: routed apps, async screens, forms, shared services, and reusable UI kits.
The difference is that Tama keeps those mechanics explicit instead of hiding them behind a render loop.

## Mental Model

| React | Tama |
| --- | --- |
| Component function reruns on every state change | Component factory runs once; observables update the DOM directly |
| `useState`, `useReducer` | Any observable or signal store, commonly `@denshya/reactive` |
| `useEffect` | Explicit async calls, or `Lifecycle` plus `MountObserver` when tied to DOM mount state |
| `useContext` | `this.tree.context.provide(...)` and `this.tree.context.require(...)` |
| `Suspense` and `lazy()` | Async components, async generators, and `this.view.set(...)` loaders |
| Router library renders different trees | Route state decides what a component inflates or shows |

## What Tama Ships And What It Does Not

Tama gives you JSX inflation, component instances, view swapping, refs, transitions, and tree context.
It deliberately does not ship a built-in form layer, query cache, or router.
That is why app code usually looks like this:

1. Keep data in explicit observables.
2. Call async functions directly from the component or from a service class.
3. Use context classes for shared state or service instances.
4. Let routing and form abstractions stay replaceable.

## Examples In This Folder

- `form.react.tsx` and `form.tama.tsx` compare a validated signup form.
- `fetch.react.tsx` and `fetch.tama.tsx` compare async data loading with retry logic.

## Package Naming

The repository name is Tama.
Stable package releases are still published as `@denshya/proton`, while local packs in this repository use `@denshya/tama`.

## Rule Of Thumb

If you would normally reach for a React hook, ask which explicit primitive you actually need:

- persistent local state
- a shared service or store
- a mount-aware side effect
- a temporary loading view
- a route-aware layout shell

Those primitives exist in Tama, but they stay separate and composable.