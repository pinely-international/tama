# API Documentation with Specs

## Accessor

## BuiltinObjects

## Guarded

## index

## Null

## Observable-BpkSyM9f

## Observable

## ProtonTreeAPI

## REQUIRED_SYMBOLS

## TreeContextAPI

## Inflator

## InflatorAdapter

## InflatorAdaptersMap

## jsx-runtime

## JSX.shared

## JSXCustomizationAPI

## JSXSerializer

## ProtonJSX

## Proton

## ProtonComponent

## ProtonDynamic

## ProtonLazy

## ProtonReconciler

## ProtonSwitch

## general

## string

## testers

## WebCompiledAssign

## WebNodeBinding

## asd

## consts

## helpers

## WebInflator

### WebInflator

#### `WebInflatorFlags` (interface)

[View Source](https://github.com/denshya/proton/blob/main/build/Inflator/web/WebInflator.d.ts#L7)

**Properties**

| Name | Type | Optional | Description |
| ---- | ---- | -------- | ----------- |
| `debug` | `boolean` | No |  |
| `skipAsync` | `boolean` | No |  |

#### `WebInflator` (class)

[View Source](https://github.com/denshya/proton/blob/main/build/Inflator/web/WebInflator.d.ts#L11)

**Properties**

| Name | Type | Optional | Description |
| ---- | ---- | -------- | ----------- |
| `jsxCache` | `any` | No |  |
| `flags` | `WebInflatorFlags` | No |  |
| `jsxAttributes` | `import("/home/kotto/github/proton/src/jsx/JSXCustomizationAPI").CustomAttributesMap` | No | Custom JSX attributes.
Adds or Overrides JSX attribute to provide new behavior.
These attributes are virtual and won't be presented in the element. |
| `inflateJSXDeeply` | `any` | No |  |
| `inflateJSXChildren` | `any` | No |  |

**Methods**

```ts
clone(): import("/home/kotto/github/proton/build/Inflator/web/WebInflator").default
```

```ts
inflateGroup(name: string, debugValue: string): HTMLDivElement
```

```ts
setDebugMarker(target: object, name: string, debugValue: string): void
```

```ts
inflate(subject: T): WebInflateResult<T>
```

```ts
inflatePrimitive(primitive: import("/home/kotto/github/proton/node_modules/type-fest/source/primitive").Primitive): Text
```

```ts
inflateFragment(): HTMLDivElement | DocumentFragment
```

```ts
inflateJSX(jsx: JSX.Element): Node
```

```ts
inflateObservable(observable: import("/home/kotto/github/proton/src/Observable").default<T> & Partial<import("/home/kotto/github/proton/src/Accessor").AccessorGet<T>>): unknown
```

```ts
inflateObservableText(observable: import("/home/kotto/github/proton/src/Observable").default<T> & Partial<import("/home/kotto/github/proton/src/Accessor").AccessorGet<T>>): Text
```

```ts
inflateObservableJSX(observable: import("/home/kotto/github/proton/src/Observable").default<T> & Partial<import("/home/kotto/github/proton/src/Accessor").AccessorGet<T>>): Element | Node | DocumentFragment
```

```ts
inflateIterable(iterable: IteratorObject<T, unknown, unknown> & Partial<import("/home/kotto/github/proton/src/Observable").default<IteratorObject<T, unknown, unknown>>>): unknown
```

```ts
inflateAsyncIterable(asyncIterable: AsyncIteratorObject<T, unknown, unknown>): unknown
```

```ts
inflateElement(type: string, options: { namespace?: string | undefined; is?: string | undefined; } | undefined): Element
```

```ts
inflateIntrinsic(type: unknown, props: any): Element | Comment
```

  Creates element and binds properties.

```ts
inflateComponent(factory: Function, props: any): any
```

```ts
applyGuardMounting(element: Element, properties: [string, unknown][], type: string): Comment | null | undefined
```

```ts
bindStyle(style: unknown, element: ElementCSSInlineStyle): void
```

```ts
bindEventListeners(listeners: any, element: Element): void
```

```ts
bindCustomProperties(props: any, element: Element): Set<string>
```

```ts
subscribeProperty(key: string | number | symbol, source: unknown, target: unknown): void
```

  Binds a property.

```ts
subscribeAttribute(target: Element, key: string, value: unknown): void
```

  Binds an attribute.

```ts
subscribe(source: unknown, targetBindCallback: (value: unknown) => void): void
```

**Tests**

- [inflates primitives to Text nodes](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L20)
- [inflates intrinsic JSX elements](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L34)
- [inflates fragments and arrays](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L42)
- [inflates iterable](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L50)
- [inflates observable](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L55)
- [inflates observable iterable](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L65)
- [inflates iterable+observable](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L74)
- [inflates observable jsx](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L83)
- [throws on async iterable input](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L96)
- [inflates async iterable component](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L101)
- [inflates sync/async components](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L149)
- [gracefully shuts down on error in component](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L161)
- [inflates nested components deeply](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L167)
- [creates SVGUse with href](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L173)
- [binds data-, aria-, and boolean attributes](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L189)
- [binds observable style string and reacts to changes](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L197)
- [binds observable style object property and reacts to changes](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L207)
- [attaches multiple event listeners and preserves native behavior](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L227)
- [guarded mount/unmount toggles DOM presence and handles rapid toggles](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L242)
- [applies custom jsxAttributes overrides (as element object property)](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L263)
- [inflates custom element](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L270)
- [caches inflate result for same jsx](https://github.com/denshya/proton/blob/main/spec/WebInflator.spec.tsx#L279)

---

## inflator

### WebInflator

**Tests**

- [should inflate basic JSX element](https://github.com/denshya/proton/blob/main/spec/inflator.spec.tsx#L22)
- [should bind State to JSX attributes and update on change](https://github.com/denshya/proton/blob/main/spec/inflator.spec.tsx#L30)
- [should bind event handlers](https://github.com/denshya/proton/blob/main/spec/inflator.spec.tsx#L39)

---

### Conditional Rendering (mounted)

**Tests**

- [should not append element when mounted is false](https://github.com/denshya/proton/blob/main/spec/inflator.spec.tsx#L56)
- [should append element when mounted becomes true](https://github.com/denshya/proton/blob/main/spec/inflator.spec.tsx#L66)

---

## jsx-types

### JSX type tests (with actual JSX)

**Tests**

- [valid intrinsic props](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L8)
- [invalid intrinsic prop (should error)](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L13)
- [event handler typing](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L19)
- [State-backed prop typing](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L24)
- [custom component props](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L30)
- [nested children typing](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L46)
- [conditional children typing](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L51)
- [fragment typing](https://github.com/denshya/proton/blob/main/spec/jsx-types.spec.tsx#L57)

---

## WebInflatorAdapter.spec.ts

### InflatorAdapter

**Tests**

- [inflate() returns the adapted result](https://github.com/denshya/proton/blob/main/spec/WebInflatorAdapter.spec.ts.spec.tsx#L27)
- [inflate() from standalone adapter](https://github.com/denshya/proton/blob/main/spec/WebInflatorAdapter.spec.ts.spec.tsx#L31)

---

## WebInflatorBinding

### WebInflator.subscribe

**Tests**

- [immediately invokes callback with primitive value](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L16)
- [does nothing for null or undefined](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L21)
- [does something to any object](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L27)
- [calls callback with initial value from observable with get](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L32)
- [subscribes and calls callback on updates](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L38)
- [supports objects with subscribe only](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L55)
- [allows unknown object types with no get/subscribe](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L66)

---

### Subscribing Property+Attribute

**Tests**

- [binds textContent to State](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L78)
- [binds boolean property and updates accordingly](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L89)
- [binds className from State](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L100)
- [removes attribute when value is null or undefined](https://github.com/denshya/proton/blob/main/spec/WebInflatorBinding.spec.tsx#L111)

---
