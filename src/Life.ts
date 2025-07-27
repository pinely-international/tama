

export class Life {
  alive = false

  when(event: "enter" | "exit") { }
  adopt(value: { onEnter?(): void, onExit?(): void }) { }
}
