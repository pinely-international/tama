export interface FSM {
  onEnter?(): void
  onExit?(): void
}

export interface EffectCleanable {
  (): () => void
}

export interface EffectSignal {
  (signal: AbortSignal): void
}


export type Sink<T> = (value: T) => void
