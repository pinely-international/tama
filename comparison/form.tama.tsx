import { State } from "@denshya/reactive"
import type { ProtonComponent } from "../src/Proton/ProtonComponent"

type Values = {
  email: string
  password: string
}
type FormErrors = Partial<Record<keyof Values, string>>

function validate(values: Values): FormErrors {
  const nextErrors: FormErrors = {}

  if (values.email.includes("@") === false) {
    nextErrors.email = "Please enter a valid email"
  }

  if (values.password.length < 10) {
    nextErrors.password = "Password must be at least 10 characters"
  }

  return nextErrors
}

export function SignupForm(this: ProtonComponent) {
  const values = new State<Values>({ email: "", password: "" })
  const errors = new State<FormErrors>({})
  const isSubmitting = new State(false)
  const status = new State("")

  const clearFieldError = (field: keyof Values) => {
    errors.set(current => ({ ...current, [field]: undefined }))
  }

  const onInput = <K extends keyof Values>(field: K) => {
    return (event: Event) => {
      const input = event.currentTarget as HTMLInputElement

      values.set((current: Values) => ({ ...current, [field]: input.value }))
      clearFieldError(field)
      status.set("")
    }
  }

  const onSubmit = async (event: Event) => {
    event.preventDefault()
    errors.set({})
    status.set("")

    const nextErrors = validate(values.get())
    if (Object.keys(nextErrors).length > 0) {
      errors.set(nextErrors)
      return
    }

    isSubmitting.set(true)

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values.get()),
      })

      if (response.status === 409) {
        errors.set({ email: "Email already in use" })
        return
      }

      if (!response.ok) throw new Error("Signup failed")

      status.set("Account created")
    } catch (error) {
      status.set(error instanceof Error ? error.message : "Signup failed")
    } finally {
      isSubmitting.set(false)
    }
  }

  return (
    <form on={{ submit: onSubmit }}>
      <label>
        Email
        <input value={values.to(current => current.email)} on={{ input: onInput("email") }} />
        {errors.to(current => current.email ? <div>{current.email}</div> : null)}
      </label>

      <label>
        Password
        <input type="password" value={values.to(current => current.password)} on={{ input: onInput("password") }} />
        {errors.to(current => current.password ? <div>{current.password}</div> : null)}
      </label>

      <button disabled={isSubmitting}>Create account</button>
      {status.to(message => message ? <p>{message}</p> : null)}
    </form>
  )
}