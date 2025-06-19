# Pre-inflation

If you want to inflate JSX before it's going to be used anywhere, you can do simply this

```js
const jsx = <div />
inflator.inflate(jsx)
```

Then if inflated JSX is reused anywhere else, the inflated JSX would be already associated with your inflator.
Meaning, it will not repeat inflation process again, it will reuse the same output.

```js
inflator.inflate(jsx) === inflator.inflate(jsx) // true
```

This way you also ensure your structures are always preserved through out attaching.

```js
const heading = (
  <hgroup>
    <h2>Title</h2>
    <p>Description</p>
  </div>
)

function Component1() {
  return heading
}

function Component2() {
  return heading
}

const componentView1 = inflator.inflate(<Component1 />)
const componentView2 = inflator.inflate(<Component2 />)

document.body.append(componentView1) // inflates `heading` for the first time.
document.body.append(componentView2) // moves `heading` to a new place, no extra inflation.
```
