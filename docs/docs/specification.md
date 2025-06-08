bun test v1.2.15 (df017990)

WebInflatorBinding.spec.tsx:
(pass) WebInflator.subscribe > immediately invokes callback with primitive value [0.39ms]
(pass) WebInflator.subscribe > does nothing for null or undefined [0.19ms]
(pass) WebInflator.subscribe > does something to any object [0.10ms]
(pass) WebInflator.subscribe > calls callback with initial value from observable with get [0.20ms]
(pass) WebInflator.subscribe > subscribes and calls callback on updates [0.35ms]
(pass) WebInflator.subscribe > supports objects with subscribe only [0.09ms]
(pass) WebInflator.subscribe > allows unknown object types with no get/subscribe [0.04ms]
(pass) Subscribing Property+Attribute > binds textContent to State [1.01ms]
(pass) Subscribing Property+Attribute > binds boolean property and updates accordingly [1.34ms]
(pass) Subscribing Property+Attribute > binds className from State [0.27ms]
(pass) Subscribing Property+Attribute > removes attribute when value is null or undefined [0.41ms]

jsx-types.spec.tsx:
(pass) JSX type tests (with actual JSX) > valid intrinsic props [0.15ms]
(pass) JSX type tests (with actual JSX) > invalid intrinsic prop (should error) [0.05ms]
(pass) JSX type tests (with actual JSX) > event handler typing [0.06ms]
(pass) JSX type tests (with actual JSX) > State-backed prop typing [0.06ms]
(pass) JSX type tests (with actual JSX) > custom component props [0.12ms]
(pass) JSX type tests (with actual JSX) > nested children typing [0.05ms]
(pass) JSX type tests (with actual JSX) > conditional children typing [0.07ms]
(pass) JSX type tests (with actual JSX) > fragment typing [0.04ms]

WebInflatorAdapter.spec.ts:
(pass) InflatorAdapter > inflate() returns the adapted result [0.26ms]
(pass) InflatorAdapter > inflate() from standalone adapter [0.03ms]

proton-component.test.ts:
(pass) ProtonComponent > initializes view, context, and inflator.clone [0.11ms]
(pass) ProtonComponent > view.set renders only on new subject [1.04ms]
(pass) ProtonComponent > view.setPrevious restores previous view [0.45ms]
(pass) ProtonComponent > ProtonComponent.evaluate throws error on error [0.70ms]
(pass) ProtonComponent > ProtonComponent.evaluate intercepts thrown errors [0.16ms]
(pass) ProtonComponent > suspendOf relays to parent when no suspense callback [0.34ms]
(pass) ProtonComponent > suspendOf with callback batches and unsuspends [1.56ms]
(pass) ProtonComponent > when(event) returns observable for mount/unmount [0.30ms]
(pass) ProtonComponent > static evaluate handles sync, async, and generator factories [4.28ms]

jsx-serializer.test.tsx:
(pass) WebJSXSerializer > toString null or undefined yields empty string [2.19ms]
(pass) WebJSXSerializer > toString arrays concatenates elements [0.31ms]
(pass) WebJSXSerializer > toString Element returns outerHTML [2.97ms]
(pass) WebJSXSerializer > toString DocumentFragment concatenates children [0.63ms]
(pass) WebJSXSerializer > toString Node (Text) returns textContent [0.06ms]
(pass) WebJSXSerializer > toString State observable uses get() [0.19ms]
(pass) WebJSXSerializer > toString iterable concatenates [0.10ms]
(pass) WebJSXSerializer > toString JSX intrinsic element [0.29ms]
(pass) WebJSXSerializer > toString self-closing tag without props [0.06ms]
(pass) WebJSXSerializer > toString object fallback throws [0.10ms]
(pass) WebJSXSerializer > styleToString and jsxAttributesToString produce correct attributes [0.30ms]
(pass) WebJSXSerializer > apply custom JSX attributes before serialization [0.23ms]
(pass) WebJSXSerializer > componentToString renders sync component [0.14ms]
(pass) WebJSXSerializer > componentToString skips async components [0.05ms]
(pass) WebJSXSerializer > skips elements with [data-nosnippet] [0.09ms]

tree-context-api.test.ts:
(pass) TreeContextAPI > provides and requires a context value [0.18ms]
(pass) TreeContextAPI > throws when requiring unprovided context [0.26ms]
(pass) TreeContextAPI > allows multiple different contexts [0.23ms]

proton-dynamic.test.ts:

WebInflator.spec.tsx:
(pass) WebInflator > inflates primitives to Text nodes [0.30ms]
(pass) WebInflator > inflates intrinsic JSX elements [1.37ms]
(pass) WebInflator > inflates fragments and arrays [1.63ms]
(pass) WebInflator > inflates iterable [1.11ms]
(pass) WebInflator > inflates observable [0.45ms]
(pass) WebInflator > inflates observable iterable [1.10ms]
(pass) WebInflator > inflates iterable+observable [1.04ms]
(pass) WebInflator > inflates observable jsx [1.30ms]
(pass) WebInflator > throws on async iterable input [0.26ms]
(pass) WebInflator > inflates async iterable component [82.70ms]
(pass) WebInflator > inflates sync/async components [1.92ms]
(pass) WebInflator > gracefully shuts down on error in component [0.19ms]
(pass) WebInflator > inflates nested components deeply [0.88ms]
(pass) WebInflator > creates SVGUse with href [0.56ms]
(pass) WebInflator > binds data-, aria-, and boolean attributes [0.48ms]
(pass) WebInflator > binds observable style string and reacts to changes [1.28ms]
(pass) WebInflator > binds observable style object property and reacts to changes [0.47ms]
(pass) WebInflator > attaches multiple event listeners and preserves native behavior [1.75ms]
(pass) WebInflator > guarded mount/unmount toggles DOM presence and handles rapid toggles [2.37ms]
(pass) WebInflator > applies custom jsxAttributes overrides (as element object property) [0.24ms]
(pass) WebInflator > inflates custom element [0.57ms]
(pass) WebInflator > caches inflate result for same jsx [0.22ms]

proton-switch.test.ts:

webnodebinding.test.ts:
(pass) WebNodeBinding.dualSignalBind > binds input value from observable to DOM and back [1.79ms]
(pass) WebNodeBinding.dualSignalBind > does not bind if input is not observable [0.12ms]
(pass) WebNodeBinding.dualSignalBind > throws for unsupported instance types [0.10ms]
(pass) WebNodeBinding.dualSignalBind > throws if descriptor is missing [0.12ms]
(pass) WebNodeBinding.dualSignalBind > memoizes native descriptor [0.18ms]

inflator.spec.tsx:
(pass) WebInflator > should inflate basic JSX element [0.35ms]
(pass) WebInflator > should bind State to JSX attributes and update on change [0.35ms]
(pass) WebInflator > should bind event handlers [0.48ms]
(pass) Conditional Rendering (mounted) > should not append element when mounted is false [0.27ms]
(pass) Conditional Rendering (mounted) > should append element when mounted becomes true [0.36ms]

protonjsx.test.ts:
(pass) ProtonJSX.Node & Element > Node constructor assigns type and props [0.08ms]
(pass) ProtonJSX.Node & Element > Element merges props when given existing Node [0.06ms]
(pass) ProtonJSX.Node & Element > Element with string returns Intrinsic node [0.04ms]
(pass) ProtonJSX.Node & Element > Element with Symbol returns Intrinsic node [0.06ms]
(pass) ProtonJSX.Node & Element > Element with FragmentSymbol returns Fragment node [0.09ms]
(pass) ProtonJSX.Node & Element > Element with function returns Component node [0.05ms]
(pass) ProtonJSX.Node & Element > Intrinsic extends Node and has correct prototypes [0.05ms]
(pass) ProtonJSX.Node & Element > Component extends Node and has correct prototypes [0.05ms]
(pass) ProtonJSX.Node & Element > Fragment extends Node and has correct prototypes [0.04ms]
----------------------------------------|---------|---------|-------------------
File                                    | % Funcs | % Lines | Uncovered Line #s
----------------------------------------|---------|---------|-------------------
All files                               |   66.24 |   77.79 |
 ../build/ProtonJSX.js                  |   75.00 |   93.33 | 1-2
 ../build/WebNodeBinding-DYe8-eRa.js    |  100.00 |   95.92 | 6
 ../build/WebNodeBinding.js             |  100.00 |  100.00 | 
 ../build/index.js                      |   71.30 |   83.20 | 47,96-97,100-103,109-111,149-165,176,179,188-191,540-544,648-660,663-673,688-713,717,721-724,730,736-738,741-743,746-755,760-776
 ../build/jsx-runtime.js                |  100.00 |  100.00 | 
 ../jsx/virtual/jsx-dev-runtime.js      |  100.00 |  100.00 | 
 dom.ts                                 |  100.00 |  100.00 | 
 ../src/Accessor.ts                     |   50.00 |   23.08 | 15-24
 ../src/BuiltinObjects.ts               |    0.00 |  100.00 | 
 ../src/Inflator/Inflator.ts            |   66.67 |  100.00 | 
 ../src/Inflator/InflatorAdaptersMap.ts |   50.00 |   44.44 | 7-11
 ../src/Inflator/web/WebInflator.ts     |   28.57 |   15.81 | 79-80,84-95,99-104,108-114,118-121,140,144-154,158-177,181-186,193-225,229-356,360-406,410-423,427-445,450-518,525,532-538,542-543,550-559,618-631,635,639-650
 ../src/Inflator/web/consts.ts          |  100.00 |  100.00 | 
 ../src/Inflator/web/helpers.ts         |    0.00 |  100.00 | 
 ../src/Null.ts                         |   50.00 |  100.00 | 
 ../src/Proton/ProtonComponent.ts       |  100.00 |  100.00 | 
 ../src/TreeContextAPI.ts               |   80.00 |   84.21 | 5-7
 ../src/jsx/ProtonJSX.ts                |   20.00 |    6.67 | 5-32
 ../src/utils/WebNodeBinding.ts         |   33.33 |   15.38 | 5-18,25-43
 ../src/utils/testers.ts                |  100.00 |   93.75 | 
----------------------------------------|---------|---------|-------------------

 89 pass
 0 fail
 158 expect() calls
Ran 89 tests across 12 files. [468.00ms]
