export class ProtonRef<T> {
  current: T

  constructor(initialValue: any) {
    this.current = initialValue
  }
}

export namespace ProtonRef {
  /** Works just like JSX `ref` attribute, assigns `value` to given refs. */
  export function resolve<T>(ref: JSX.Ref<T> | JSX.Ref<T>[], value: T): void {
    // Array of refs
    if (ref instanceof Array) {
      for (const r of ref) resolve(r, value)
      return
    }

    // ProtonRef instance
    if (ref instanceof ProtonRef) {
      ref.current = value
      return
    }

    // Plain object ref (e.g. { current: ... })
    if (ref != null && typeof ref === "object" && "current" in (ref as any)) {
      ; (ref as any).current = value
      return
    }

    // Callback ref
    if (ref instanceof Function) {
      ref(value)
      return
    }
  }

  /**
   * Require `ref` value to be non-nullable.
   *
   * @throws `RefError` if value is nullable (`null` or `undefined`).
   */
  export function assert<T>(ref: ProtonRef<T>): asserts ref is ProtonRef<T & {}> {
    if (ref.current == null) throw new ProtonRefError("Required Ref was not satisfied", ref)
  }

  /** Takes all refs and outputs one. */
  export function rebase<T>(refs: Iterable<ProtonRef<T>>): ProtonRef<T> { }

  export function from<T>(other: ProtonRef<T>): ProtonRef<T>
  export function from<T>(other: ProtonRef<T> | T): ProtonRef<T>
  export function from<T>(other: T): ProtonRef<T>
  export function from(arg: unknown): any {
    if (arg instanceof ProtonRef) return new ProtonRef(arg.current)

    return new ProtonRef(arg)
  }
}

class ProtonRefError extends TypeError {
  constructor(message: string, ref: ProtonRef<any>) {
    super(message)
    console.error(ref)
  }
}

export declare const ProtonRefOverload: {
  new <T>(initialValue: T): ProtonRef<T>;
  new <T>(initialValue?: T | null): ProtonRef<T | null>;
} & typeof ProtonRef
