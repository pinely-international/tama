# Serializer

`WebJSXSerializer` serves the purpose of serializing given JSX, Components and Primitives (including adopted).

Currently supports only sync serialization to string, but it is planned to support async components and data streaming.

```tsx
const jsxSerializer = new WebJSXSerializer
const jsxString = jsxSerializer.toString(<div>123</div>) => "<div>123</div>"
```

:::tip
See guide for [SSR](../ssr.md)
:::
