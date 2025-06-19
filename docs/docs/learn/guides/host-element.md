# Host Element

To render inflated elements or components, you need to attach the result of inflation (which is always a `Node`) to a parent.

```js
const componentView = inflator.inflate(<Component />)
document.body.append(componentView)
```

Unlike to many libraries like React, where you have to create root completely hijacking an element.

```js
const root = createRoot(document.getElementById("root"))
root.render(<Component />)
```
