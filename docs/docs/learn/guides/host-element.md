# Host Element

Unlike to many libraries like React, where you have to create root completely hijacking an element.

```js
const root = createRoot(document.getElementById("root"))
root.render(<Component />)
```

In Tama.js, to render inflated elements or components, you can directly attach result of inflation (which is always at least `Node`) to a parent.

```js
const componentView = inflator.inflate(<Component />)
document.body.append(componentView)
```

This means you don't need to create or use any existing element to be able to render a component.
