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
}

export declare const ProtonRefOverload: {
  new <T>(initialValue: T): ProtonRef<T>;
  new <T>(initialValue?: T | null): ProtonRef<T | null>;
} & typeof ProtonRef
