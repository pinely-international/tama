# `Proton.Dynamic`

Instead of creating one component and observables to be handled internally, thus making it "Static".
You can make it "Dynamic" by swapping components/elements based on observables passed as `props`.

This is extremely useful if you have nested observables.

```tsx
<span>{Proton.Dynamic(Component, { id: observableId })}</span>
```
