# `Tama.Switch`

It can be used both for Component View swapping and as a part of any JSX element.

```tsx
function SwitchComponent(this: Tama.Component) {
  const switcher = new Tama.Switch({
    banned: <span>Banned</span>,
    pending: <span>Pending</span>,
    default: <span>Loading...</span>
  })

  switcher.set("banned") // renders `<span>Banned</span>`.
  switcher.set("pending") // renders `<span>Pending</span>`.
  switcher.set("default") // renders `<span>Loading...</span>`.

  switcher.sets(this.view)
  return switcher.current.value
}
```

In case of being part of JSX, you should connect `ProtonSwitchWebInflator`.

```tsx
const inflator = new WebInflator
inflator.adapters.add(ProtonSwitchWebInflator)
```

```tsx
async function UserProfile() {
  const userStatusSwitch = new Tama.Switch({
    banned: <Status color="red">Banned</Status>,
    pending: <Status color="yellow">Pending</Status>,
    default: <Status color="green">Active</Status>
  })

  const user = await requestCurrentUser()
  user.status.sets(userStatusSwitch)

  return (
    <div>
      ...
      <div>Status: {userStatusSwitch}</div>
      ...
    </div>
  )
}
```
