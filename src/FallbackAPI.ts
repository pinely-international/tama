import { State } from "@denshya/reactive"

type FallbackResult = Error | Promise<unknown> | true | null

export class Fallback<ErrorView = unknown, PendingView = unknown> {
  readonly error = new State<Error | null>(null)
  readonly pending = new State<boolean | Promise<unknown>>(false)

  /** @internal */
  readonly result = State.combine([this.error, this.pending], (error, pending) => error ?? (pending || null))

  constructor(public views: { error: ErrorView, pending: PendingView }) { }

  resolve<T>(value: T, result: FallbackResult): T | ErrorView | PendingView {
    if (result == null) return value
    if (result === true) return this.views.pending

    if (result instanceof Error) return this.views.error
    if (result instanceof Promise) {
      result.then(() => this.pending.set(false))
      return this.views.pending
    }

    throw new TypeError("Unreachable code, something went wrong during Tama Fallback Resolution", { cause: this })
  }
}


class FallbackAPI {
  catch<T>(thrown?: T): PromiseLike<T> { }
}

const asd = new FallbackAPI
asd.catch()
