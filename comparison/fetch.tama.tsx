import { State } from "@denshya/reactive"
import type { ProtonComponent } from "../src/Proton/ProtonComponent"

type User = { id: string; name: string }
type LoadState = "idle" | "loading" | "success" | "error"

async function fetchUsers() {
  const response = await fetch("/api/users")
  if (!response.ok) throw new Error("Failed to load users")

  return response.json() as Promise<User[]>
}

export function UsersPage(this: ProtonComponent) {
  const users = new State<User[]>([])
  const status = new State<LoadState>("idle")
  const errorMessage = new State("")

  const load = async () => {
    status.set("loading")
    errorMessage.set("")

    try {
      users.set(await fetchUsers())
      status.set("success")
    } catch (error) {
      errorMessage.set(error instanceof Error ? error.message : "Failed to load users")
      status.set("error")
    }
  }

  void load()

  const content = status.to(state => {
    if (state === "loading") return <div>Loading...</div>

    if (state === "error") {
      return (
        <div>
          Failed. {errorMessage}
          {" "}
          <button type="button" on={{ click: load }}>Retry</button>
        </div>
      )
    }

    return (
      <ul>
        {users.get().map(user => (
          <li>{user.name}</li>
        ))}
      </ul>
    )
  })

  return (
    <section>
      <header>
        <h1>Users</h1>
        <button type="button" disabled={status.is("loading")} on={{ click: load }}>
          Reload
        </button>
      </header>
      {content}
    </section>
  )
}