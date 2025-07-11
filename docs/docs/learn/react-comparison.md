---
sidebar_position: 1
---

# Comparing to React

## React's Reversed Thinking

React tries to make plain values to be reactive, in that process they invent hooks that control what are less dynamic (`useMemo`, `useCallback`, `useEffect`) and what should re-render component (i.e. `useState`).

In the seek of using only plain values for building **reactive** UI Components, they introduce problems:

The **always re-rendering** and **all values are dynamic**
makes developing UI Components **counter-intuitive** and **fragile**.

- A developer must track all those values that should be static or less-dynamic "manually"
and apply hooks accordingly.
- A developer must ensure the correct hooks order.
- A developer must ensure the used global values will not be updated in-between renders.
- A developer can't declare React states outside components.
- A developer can compose custom hooks but only but using what React gives (forbidding reusing across other frameworks).

### Consider this example

```tsx
function Component() {
  const [event, setEvent] = useState<PointerEvent | null>(null)

  return (
    <div onPointerMove={setEvent}>
      <div className="tooltip" style={{ position: "absolute", top: event?.clientY, left: event?.clientX }}>
        ...
      </div>
    </div>
  )
}
```

Naturally, it doesn't come in mind that every time `onPointerMove` fires it will not only call `setEvent`,
but also update the entire component and everything it composes using JSX.

While in Proton it lays smooth in reasoning about what happens, while generally preserves code outlook

```tsx
function Component() {
  const event = new State<PointerEvent | null>(null)

  return (
    <div on={{ pointermove: x => event.set(x) }}>
      <div className="tooltip" style={{ position: "absolute", top: event.$.clientY, left: event.$.clientX }}>
        ...
      </div>
    </div>
  )
}
```

You may say that `$` in `event.$.clientY` introduces magic itself, but it is not, you can inspect it and understand
that it selects a key and creates a new `State`, where in React there is nothing to investigate to give any hints on what's happening.

The `$` is something you are not to face usually - not "magic" - the magic is where you can't understand
and must believe something should happen just because you were told it should.

And also this is just a variation of State manager, anything could be implemented instead of `$`, this is just one library choice.

> **Author's Opinion**
>
> My impression is that React is only pretending to be reactive while, it's just a endlessly re-rendering static tree of JSX.
> The reactivity is faked by diffing what was there and what is now, not "understanding" what actually was changed.

### Consider another example with `useMemo`

```tsx
function Component() {
  const [event, setEvent] = useState<PointerEvent | null>(null)

  return (
    <div onPointerMove={setEvent}>
      <div className="tooltip" style={{ position: "absolute", top: event?.clientY, left: event?.clientX }}>
        ...
      </div>
    </div>
  )
}
```

## asd 1

## asd 2

## asd 3

## asd 4

## Why not SolidJS

While SolidJS is moving in the same direction of **Fine-Grained** updates and adds true reactivity,
it still relies on "magic" - SolidJS use [Closure-based Signals](https://github.com/FrameMuse/closure-signal),
which works behind the scene and not explicit at all, you must keep in mind what is reactive and what is not.
