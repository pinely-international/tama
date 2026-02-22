# Hooking to Lifecycle via `MountRoutine`

## Starting with `MountRoutine`

By default the library doesn't include lifecycle to save bundle, but hooking to element lifecycle is trivial anyway.

To do so, you need to import `MountRoutine`

```tsx
import { MountRoutine } from "@denshya/tama"
```

It will define logic/operations that happen on **mount** and **unmount**.
In other words, when something is currently used or not.

```tsx
// Define logic e.g. when an element appears on screen.
new MountRoutine(() => {
  console.log("mounted!") // You can subscribe to something.
  return () => console.log("unmounted!") // You should unsubscribe to make sure CPU doesn't waste time and avoid memory leaks.
})
```

> [!NOTE]
> It doesn't mean that it will never be used anymore once it's unmounted. The routine may happen repeatedly: e.g. user may change visibility of a section back and forth.

`MountRoutine` should be hooked to `MountObserver`, so that it can track an element connection (mount) state.

```tsx
import { MountRoutine, MountObserver } from "@denshya/tama"

// Define logic e.g. when an element appears on screen.
const testMountRoutine = new MountRoutine(() => {
  console.log("mounted!") // You can subscribe to something.
  return () => console.log("unmounted!") // You should unsubscribe to make sure CPU doesn't waste time and avoid memory leaks.
})
```

But `MountObserver` should be given an element to observe - this can be done with `ref` attribute that calls back when an element is created (but it may not be mounted yet).

To make a good use of the mounting routine, it's common to combine it with `Ref` object that captures element reference:

```tsx title="Example.tsx"
import { Ref, MountRoutine, MountObserver } from "@denshya/tama"

function Navbar() {
  const navRef = new Ref<HTMLElement>
  const navMountRoutine = new MountRoutine(() => {
    Ref.assert(navRef)
    snapToTop(navRef.current) // Imaginary side-effect function.

    console.log("Nav mounted!")
    return () => console.log("Nav unmounted!")
  })

  return (
    <nav ref={[navRef, MountObserver.with(navMountRoutine)]}>Menu</nav>
  )
}
```

In contrast to React, this is very much explicit hook, which is intentionally so - to make it as clear as possible.

```tsx title="ReactExample.tsx"
function Navbar() {
  const navRef = useRef<HTMLElement>()
  useEffect(() => {
    if (navRef.current == null) return // <== Pitfall, you might be confused why code didn't run.
    snapToTop(navRef.current)

    console.log("Nav mounted!")
    return () => console.log("Nav unmounted!")
  }, [])

  return (
    <nav ref={navRef}>Menu</nav>
  )
}
```

## Alternative Definitions

`MountRoutine` has two more overloads to try to be a bit more helpful:

### 1. Signal-based routine

This is useful to define subscriptions to listeners since it's a headache to unsubscribe via "cleanup" callback.

```tsx
new MountRoutine(signal => {
  window.addEventListener("pointerdown", event => {...}, { signal })
  window.addEventListener("pointerdup", event => {...}, { signal })
  window.addEventListener("pointermove", event => {...}, { signal })
})
```

### 2. Object-based routine

If you need only teardown logic to define, you can simply use `onUnmount`.

```tsx
new MountRoutine({
  onUnmount: () => console.log("Unmounted")
})
```

## Usage on DOM Elements

If you have already defined `MountRoutine`, you can be safe about reusing it on plain DOM elements.
To do that you'd need `MountObserver` to be used like that:

```tsx title="DOMExample.tsx"
const someElement = document.createElement("div")

const someMountRoutine = new MountRoutine(signal => {
  window.addEventListener("pointerdown", event => {...}, { signal })
  window.addEventListener("pointerdup", event => {...}, { signal })
  window.addEventListener("pointermove", event => {...}, { signal })
})

const mountObserver = new MountObserver
mountObserver.routines.add(someMountRoutine)
mountObserver.observe(someElement)
```
