---
sidebar_position: 5
---

# Custom Inflate

## Inflator Adapters

This kind of customization allows you to override the output of `inflate` method.

### Abstract example

You can provide inflate instructions to your own structures, lately they can be inserted as part of JSX.

```tsx
class PriceWebInflator {
  constructor(inflator: Inflator) {}

  inflate(price: unknown) {
    if (price instanceof Price === false) return

    const span = document.createElement("span")
    span.textContent = price.value + price.sign

    return span
  }
}

const inflator = new WebInflator
inflator.adapters.add(PriceWebInflator)

function MyApp() {
  return <div>{new Price(123, "USD")}</div>
}

const MyAppInflated = inflator.inflate(<MyApp />)
document.getElementById("root").replaceChildren(MyAppInflated)
```
