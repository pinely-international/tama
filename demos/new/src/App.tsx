import { State } from "@denshya/reactive"

function App() {
  const name = new State("Tama")
  const clicks = new State(0)
  const title = name.to(name => name.trim() === "" ? "Hello" : `Hello, ${name}`)

  return (
    <main className="app-shell">
      <section className="app-card">
        <p className="app-card__eyebrow">Starter demo</p>
        <h1>{title}</h1>
        <p className="app-card__copy">Components run once. Signals update the DOM directly.</p>

        <label className="app-field">
          <span>Name</span>
          <input value={name} placeholder="Type a name" />
        </label>

        <button type="button" className="app-button" on={{ click: () => clicks.set(value => value + 1) }}>
          Clicked {clicks} times
        </button>
      </section>
    </main>
  )
}

export default App