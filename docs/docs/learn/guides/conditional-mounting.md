# Conditional Mounting

## Guard Pattern

[Guard pattern](https://en.wikipedia.org/wiki/Guard_(computer_science)) usually refers to a Return/Throw Guard in JavaScript.

However, in Proton it is a predicate, which defines if an object is ok to use. If the `valid` guard return `false`, normally it is simply skipped.

```tsx
const plain = { value: 1 }
const guarded = { value: 1, valid(value) { return value > 0 } }
```

This very mechanism is used to tell if an element should be mounted or unmounted by invoking `valid` function.

In case of Observable Guarded object, it will call the guard on each update.

## JSX Attribute Guarding

Each JSX attribute can be a **Mounting Guard**, which means the element is mounted only when every attribute is **NOT** guarded.

TypeScript: This approach allows type narrowing, so your property is always getting a correct type.

you can use `guard` method or built-in predicates like `required`.

```tsx
const className = new State("")
const content = new State<string | null>(null)

const Component = () => (
  <>
    <span className={Proton.guard.avoid(className)}>{Proton.guard.require(content)}</span>
    <span className={Proton.guard(className, x => !x)}>{Proton.guard(content, x => x)}</span> // Equal Alternative.
  </>
)
```

As you can see even the children can be guarded. The `guard` method can be implemented by your State library or you can create your own utility function do that to cover your special cases.

:::tip

If you dislike this approach, you can implement the way SolidJS does it or your unique way by [Extending Default Behavior](../custom/custom-jsx.md).

:::

## Real-World Example

A component example I converted from React and changed a bit for demonstration purposes.

```tsx
import { State, StateBoolean, StateOrPlain } from "@denshya/reactive"


interface MiniProfileProps {
  user: StateOrPlain<User>
}

function MiniProfile(props: MiniProfileProps) {
  const user = State.from(props.user)

  const inputValue = new State("")
  const inputMounted = new StateBoolean(false)

  inputValue.sets(user.$.avatar)

  return (
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <button className="mini-profile__letter" mounted={user.$.avatar.is(null)}>
         <ColoredLetter letter={user.$.firstName.$[0]} />
        </button>
        <img className="mini-profile__avatar" src={Proton.guard.require(user.$.avatar)} alt="avatar" />
        <input value={inputValue} mounted={inputMounted} />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{user.$.firstName} {user.$.lastName.$[0]}.</div>
          <div className="mini-profile__email">{user.$.email}</div>
        </div>
      </div>
      <button type="button" on={{ click: () => inputMounted.toggle() }}>
        <Icon name="pen" />
      </button>
    </div>
  )
}
```
