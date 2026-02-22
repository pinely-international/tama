export interface FMS {
  onEnter?(): void
  onExit?(): void
}

export interface MountFSM {
  onMount?(): void
  onUnmount?(): void
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


export type Sink<T> = (value: T) => void
