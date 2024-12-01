class Deferred<T> {
  public promise: Promise<T>
  public resolve!: (value: T) => void
  public reject!: (reason: unknown) => void

  public value: T | null = null
  public awaited = false

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })

    this.promise.then(value => this.value = value)
    this.promise.finally(() => this.awaited = true)
  }
}

export default Deferred
