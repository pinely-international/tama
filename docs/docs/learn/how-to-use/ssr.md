---
sidebar_position: 4
---

# SSR (Server Side Rendering)

Tama currently supports server rendering through its JSX serializers.
The most important point is that SSR is a serialization step, not a separate rendering engine.

## Available Serializers

### `WebJSXSerializer`

Use this when the rendered tree is fully synchronous.

```tsx
import { WebJSXSerializer } from "@denshya/proton"

const serializer = new WebJSXSerializer
const html = serializer.toString(<App />)
```

### `WebJSXSerializerAsync`

Use this when components or values can be async.

```tsx
import { WebJSXSerializerAsync } from "@denshya/proton"

const serializer = new WebJSXSerializerAsync
const html = await serializer.asyncToString(<App />)
```

This serializer understands promises, async components, and async generators.

## Reusing Custom Inflator Behavior

If your app uses custom JSX attributes or inflator adapters on the client, pass the same inflator configuration to the serializer.

```tsx
const inflator = new WebInflator
applyCustomAttributes(inflator)

const serializer = new WebJSXSerializerAsync
serializer.inherit(inflator)
```

That keeps server output aligned with your client-side customization.

## A Typical Flow

1. Build your page component normally.
2. Create a serializer on the server.
3. Serialize the app to a string.
4. Inject that string into your HTML template.

```tsx
const appHTML = await serializer.asyncToString(<App />)
const html = template.replace("<!--app-->", appHTML)
```

## DOM Requirements On The Server

If your components create or inspect actual DOM nodes during rendering, your server environment needs a DOM implementation or a polyfill.
The docs app in this repository does exactly that in `docs/ssr/ssg.ts`.

If your render path stays inside plain JSX and serializer-friendly values, the setup can stay simpler.

## Current Limits

These limits are important today:

- the synchronous serializer skips async components
- no first-class hydration API is documented in this checkout
- streaming SSR is not documented as a stable, production-ready Tama workflow yet

For now, treat SSR as a string-generation tool and design client boot carefully if the page must become interactive after load.

## Recommendation

For static generation or server-only HTML output, Tama's serializer story is already usable.
For SSR plus client pickup, document your app's own hydration strategy explicitly until the library surface settles further.

Continue with [Hydration And Client Pickup](./hydration.md) for the current recommended patterns.
