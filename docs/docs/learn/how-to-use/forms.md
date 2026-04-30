---
sidebar_position: 2
---

# Forms

Tama does not require a built-in form abstraction.
Most forms are built from writable observable values plus explicit submit logic.

## Simple Field Binding

```tsx
import { State } from "@denshya/reactive"

function NameField() {
  const name = new State("")
  return <input value={name} />
}
```

Because the input is bound to a writable state object, updates flow in both directions.

## A Practical Form Structure

For real forms, it is usually clearer to keep one state per field plus a few derived states for UI status.

```tsx
import { State } from "@denshya/reactive"

class SignupFormState {
  readonly email = new State("")
  readonly password = new State("")
  readonly pending = new State(false)
  readonly status = new State("")
  readonly errors = new State<{ email?: string; password?: string; form?: string }>({})

  validate() {
    const nextErrors: { email?: string; password?: string } = {}

    if (this.email.get().includes("@") === false) {
      nextErrors.email = "Please enter a valid email address"
    }

    if (this.password.get().length < 10) {
      nextErrors.password = "Password must be at least 10 characters"
    }

    this.errors.set(nextErrors)
    return Object.keys(nextErrors).length === 0
  }
}

function SignupForm() {
  const form = new SignupFormState()

  const submit = async (event: Event) => {
    event.preventDefault()
    form.status.set("")

    if (form.validate() === false) return

    form.pending.set(true)
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.get(),
          password: form.password.get(),
        }),
      })

      if (response.status === 409) {
        form.errors.set({ email: "Email already in use" })
        return
      }

      if (!response.ok) throw new Error("Signup failed")

      form.status.set("Account created")
    } catch (error) {
      form.errors.set({ form: error instanceof Error ? error.message : "Signup failed" })
    } finally {
      form.pending.set(false)
    }
  }

  return (
    <form on={{ submit }}>
      <label>
        Email
        <input value={form.email} />
        {form.errors.to(errors => errors.email ? <div>{errors.email}</div> : null)}
      </label>

      <label>
        Password
        <input type="password" value={form.password} />
        {form.errors.to(errors => errors.password ? <div>{errors.password}</div> : null)}
      </label>

      <button disabled={form.pending}>Create account</button>
      {form.errors.to(errors => errors.form ? <p>{errors.form}</p> : null)}
      {form.status.to(message => message ? <p>{message}</p> : null)}
    </form>
  )
}
```

## Why This Pattern Works Well In Tama

- component functions run once, so local state creation is stable
- field state stays explicit and debuggable
- there is no special form lifecycle hidden behind hooks
- you can move the form state into a class and provide it through tree context later if needed

## When To Use A Store Class

Move form logic into a class when:

- several components edit the same form
- a wizard spans multiple screens
- autosave and validation rules should live outside the view layer

## Third-Party Form Libraries

Tama does not prevent form libraries, but the simplest path is usually direct observable state.
If a third-party library exposes subscription and snapshot APIs cleanly, wrap it in a Tama-friendly object instead of forcing React-specific assumptions into the component.
