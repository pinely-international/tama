# Redux Demo

This is how you can use Redux in Proton.

## Preparation

Let's assume we're implementing the following

```ts
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    incremented: state =>state.value += 1,
    decremented: state => state.value -= 1
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})
```

As we now, **Proton** relies on observables to handle element updates and connections, so you need a wrapper to tell Proton to handle this.
It's done in very simple way as Redux is very close to observable on its own.

For simplicity reasons, let's use [Reactive](https://github.com/denshya/reactive) library as it has Reactive Accessor (`$`), which will help us accessing underlying properties of your store.

```ts
const storeState = new State(store.getState())
store.subscribe(() => storeState.set(store.getState()))
```

That's it!

## Example

```tsx
function Component() {
  return <div className="username">{storeState.$.user.$.name}</div>
}
```

If you don't like such accessor, you can use `to` method to select desired property
```tsx
function Component() {
  const username = storeState.to(state => state.user.name)

  return <div className="username">{username}</div>
}
```

or rely on separate state declarations

```tsx
function Component() {
  const username = new State(storeState.current.user.name)
  storeState.subscribe(state => usename.set(state.user.name))

  return <div className="username">{username}</div>
}
```

In this case you may even drop `storeState` at all.

```tsx
function Component() {
  const username = new State(store.getState().user.name)
  store.subscribe(() => usename.set(store.getState().user.name))

  return <div className="username">{username}</div>
}
```

With this you can use ANY state manager, let's take this one with a small code - [Event-based Signal](https://github.com/FrameMuse/event-signal)

```tsx
function Component() {
  const username = new EventSignal(store.getState().user.name)
  store.subscribe(() => usename.set(store.getState().user.name))

  return <div className="username">{username}</div>
}
```

## Conclusion

As you can see, the pattern is similar in every approach, the key is difference explicitness.
