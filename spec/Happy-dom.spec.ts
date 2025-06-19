// import { Window } from "happy-dom"
import "./dom"

import { expect, test } from "bun:test"

test("MyEl fires connectedCallback", async () => {
  // const window = new Window()
  const doc = window.document
  const messages: any[] = []

  class MyEl extends HTMLElement {
    connectedCallback() {
      messages.push("connected")
    }
  }
  window.customElements.define("my-el", MyEl as never)

  const el = doc.createElement("my-el")
  doc.body.appendChild(el)

  // Wait for any async in lifecycle:
  await window.happyDOM.whenAsyncComplete()

  expect(messages).toContain("connected")
})
