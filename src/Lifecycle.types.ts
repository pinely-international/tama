
export interface FSM {
  onEnter?(): void
  onExit?(): void
}

// export interface Suspensible {
//   onEnter?(): void
//   onExit?(): void
// }

export interface EffectCleanable {
  (): () => void
}

export interface EffectSignal {
  (signal: AbortSignal): void
}
