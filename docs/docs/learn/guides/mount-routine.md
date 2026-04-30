# Lifecycle

## Basic Usage (Universal)

```tsx
import { Lifecycle } from "@denshya/proton"

new Lifecycle(() => {
  console.log("mounted")
  return () => console.log("unmounted")
})
```

## Signal-Based Cleanup

For DOM listeners, the signal overload is usually the most ergonomic.

```tsx
import { Lifecycle } from "@denshya/proton"

const pointerLifecycle = new Lifecycle(signal => {
  window.addEventListener("pointerdown", event => {
    console.log(event.clientX)
  }, { signal })
})
```

## Attaching It To An Element

Use `MountObserver.with(...)` together with `ref` when the side effect depends on a specific element.

```tsx title="Navbar.tsx"
import { Lifecycle, MountObserver, Ref } from "@denshya/proton"

function Navbar() {
  const navRef = new Ref<HTMLElement | null>(null)
  const navLifecycle = new Lifecycle(() => {
    Ref.assert(navRef)
    navRef.current.scrollIntoView({ block: "start" })

    return () => console.log("navbar unmounted")
  })

  return (
    <nav ref={[navRef, MountObserver.with(navLifecycle)]}>
      Menu
    </nav>
  )
}
```

It should read as: "Ref mount observer with nav lifecycle". The lifecycle runs when the element is mounted, and the cleanup runs when it is unmounted.

## Why It Is Explicit

In React, mount work often gets grouped under `useEffect(..., [])`.
In Tama, mount-aware logic stays directly attached to the element that owns it.
That keeps the scope of the side effect obvious.

And the lifecycle API is flexible enough to support non-DOM side effects and signal-based cleanup without forcing a DOM element or a specific hook convention, making it easily reusable/transferrable in different contexts.
