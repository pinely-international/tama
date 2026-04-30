---
sidebar_position: 5
---

# Hydration And Client Pickup

This page describes the current Tama story for server-rendered HTML becoming interactive on the client.

## Current Status

Tama currently exposes serializers for SSR, but it does not expose a first-class public `hydrate(...)` API in this checkout.

That distinction matters:

- **SSR** means generating HTML on the server.
- **Hydration** means attaching client behavior to the existing server DOM without recreating it.
- **Client re-inflation** means rendering the app again on the client and replacing the server markup.

Tama supports the first and the third today.
The second is not a documented public API yet.

## What The Docs App Does

This docs app is server-rendered with `WebJSXSerializerAsync` and then booted on the client by inflating the app again and calling `replaceChildren(...)` on the root element.

That means the current repository example is **client re-inflation**, not DOM-preserving hydration.

> [!TIP]
> Client re-inflation is often fast enough for typical docs sites, admin panels, and dashboards.
The server DOM is replaced as a whole, so there is no diffing overhead, and the client can skip data fetching by serializing initial state into the HTML.
> Tama is 3-4x faster than React in this mode, so it is a good fit for many use cases even without hydration.

## Supported Strategy 1: SSR Only

If the page does not need client-side interactivity after load, generate HTML and stop there.

```tsx
import { WebJSXSerializerAsync } from "@denshya/proton"

const serializer = new WebJSXSerializerAsync
const html = await serializer.asyncToString(<App />)
```

This is the simplest and most stable path.

## Supported Strategy 2: SSR Plus Fresh Client Mount

If the page needs interactivity, the safest documented Tama path today is to render on the server and then mount a fresh client view.

```tsx
import { WebInflator } from "@denshya/proton"

const inflator = new WebInflator
const root = document.getElementById("root")!

root.replaceChildren(inflator.inflate(<App />))
```

Important: this replaces the server DOM under the root.
It is not hydration.

## Carrying Initial State Across The Boundary

If you do SSR plus fresh client mount, serialize your initial data explicitly.

### Server

```html
<script id="app-state" type="application/json">
  {"user":{"name":"FrameMuse"}}
</script>
```

### Client

```tsx
function readInitialState<T>(id: string): T | null {
  const element = document.getElementById(id)
  if (element == null) return null

  return JSON.parse(element.textContent || "null") as T | null
}

const initialState = readInitialState<{ user: { name: string } }>("app-state")

const inflator = new WebInflator
document.getElementById("root")!.replaceChildren(
  inflator.inflate(<App initialState={initialState} />)
)
```

This avoids duplicate data fetching when the client mounts.

## Supported Strategy 3: Progressive Enhancement And Islands

Because Tama is rootless, it also works well for targeted client islands.
Instead of booting the whole page, mount only the interactive parts.

### Server HTML

```html
<div id="search-island">
  <form>
    <input name="q" />
  </form>
</div>
```

### Client

```tsx
const inflator = new WebInflator
const island = document.getElementById("search-island")

if (island != null) {
  island.replaceChildren(inflator.inflate(<SearchWidget />))
}
```

Again, this is replacement, not node-preserving hydration, but it is often enough for docs sites, admin panels, and progressively enhanced pages.

## When You Truly Need Hydration

If your requirement is preserving server-rendered DOM and attaching listeners in place, the current public Tama surface is not documenting that as a built-in workflow.

For now, treat true hydration as:

- a custom bridge you would build yourself
- or a feature area that still needs first-class library design

## Recommendation

Use this decision rule today:

1. static HTML only: serializer only
2. interactive app shell: SSR plus fresh client mount
3. partial interactivity: progressive islands with targeted mounts
4. strict hydration requirement: custom solution for now

Continue with [SSR](./ssr.md) for serializer details and [Testing](../guides/testing.md) for validating client pickup behavior.
